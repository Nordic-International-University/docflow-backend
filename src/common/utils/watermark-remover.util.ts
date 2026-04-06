import { PDFDocument, PDFName, PDFStream } from 'pdf-lib'
import { promisify } from 'util'
import { inflate, deflate } from 'zlib'

const inflateAsync = promisify(inflate)
const deflateAsync = promisify(deflate)

interface WatermarkRemovalOptions {
  watermarkPatterns?: string[]
}

interface WatermarkRemovalResult {
  success: boolean
  originalSize: number
  cleanSize: number
  bytesRemoved: number
  pagesProcessed: number
  totalPages: number
  watermarksRemoved: number
}

interface WatermarkBoundaries {
  start: number
  end: number
}

/**
 * Detect if content contains Apryse watermark
 * @param content - Decompressed PDF stream content
 * @param patterns - Watermark text patterns to search for
 * @returns True if watermark detected
 */
function containsAprysWatermark(content: string, patterns: string[]): boolean {
  // Check for "apryse" text in various formats
  for (const pattern of patterns) {
    if (content.toLowerCase().includes(pattern.toLowerCase())) {
      return true
    }
  }

  // Check for common Apryse watermark XObject patterns
  // NOTE: Removed /Fm1 as it's also used for legitimate stamps from XFDF merges
  const watermarkPatterns = [
    '/WaterMark', // Explicit watermark naming
    '/Watermark',
    'Apryse', // Company name
    'apryse',
  ]

  for (const pattern of watermarkPatterns) {
    if (content.includes(pattern)) {
      return true
    }
  }

  // Check for structural watermark patterns (embedded graphics)
  // These patterns indicate watermark graphics at the beginning of content streams
  const structuralPatterns = [
    '/Div <</MCID 0>>', // Marked content for watermark div
    '/Artifact', // Artifact watermarks
  ]

  for (const pattern of structuralPatterns) {
    const idx = content.indexOf(pattern)
    // Only consider it a watermark if it's in the first 20% of the stream
    // (watermarks are typically at the beginning)
    if (idx >= 0 && idx < content.length * 0.2) {
      return true
    }
  }

  return false
}

/**
 * Check if an XObject is a watermark or a legitimate stamp/form
 * @param xobjRef - Reference to the XObject
 * @param context - PDF context
 * @param watermarkPatterns - Watermark text patterns
 * @returns True if it's a watermark, false if it's a legitimate stamp
 */
async function isWatermarkXObject(
  xobjRef: any,
  context: any,
  watermarkPatterns: string[],
): Promise<boolean> {
  try {
    const xobj = context.lookup(xobjRef)

    if (!(xobj instanceof PDFStream)) {
      return false
    }

    // Get XObject properties
    const subtype = xobj.dict.lookup(PDFName.of('Subtype'))
    const subtypeStr = subtype?.toString() || ''

    // Only analyze Form XObjects (not Image XObjects)
    if (!subtypeStr.includes('/Form')) {
      return false
    }

    // Try to decompress and analyze content
    const compressedBytes = (xobj as any).contents
    try {
      const decompressed = await inflateAsync(Buffer.from(compressedBytes))
      const content = decompressed.toString('latin1')

      // Check if content contains watermark patterns
      const hasWatermarkPattern = containsAprysWatermark(
        content,
        watermarkPatterns,
      )

      // A Form XObject is a watermark if:
      // 1. It contains watermark patterns (apryse, watermark, etc.)
      // 2. It has typical watermark structure (Div MCID, Artifact, etc.)

      // A Form XObject is a legitimate stamp if:
      // 1. It's small (just references to images or simple graphics)
      // 2. It doesn't contain watermark patterns
      // 3. It has specific dimensions (BBox) typical of stamps

      const isSmallReferenceOnly =
        content.length < 100 && content.includes(' Do')

      if (isSmallReferenceOnly && !hasWatermarkPattern) {
        // Likely a stamp that just references an image (like /Im0 Do)
        return false
      }

      return hasWatermarkPattern
    } catch (error) {
      // If we can't decompress, assume it's not a watermark (might be image data)
      return false
    }
  } catch (error) {
    return false
  }
}

/**
 * Find watermark boundaries in content stream
 * @param content - Decompressed PDF stream content
 * @returns Object with start and end positions, or null if not found
 */
function findWatermarkBoundaries(content: string): WatermarkBoundaries | null {
  const strategies = [
    // Strategy 1: Look for MCID markers (most common)
    () => {
      const divStart = content.indexOf('/Div <</MCID 0>>')
      const spanStart = content.indexOf('/Span <</MCID 1>>')

      if (divStart >= 0 && spanStart > divStart) {
        // Look backwards for graphics state save "qq" or "q"
        let actualStart = divStart
        for (let i = divStart - 1; i >= Math.max(0, divStart - 20); i--) {
          if (
            content.substring(i, i + 3) === ' qq' ||
            content.substring(i, i + 2) === ' q'
          ) {
            actualStart = i
            break
          }
        }
        return { start: actualStart, end: spanStart }
      }
      return null
    },

    // Strategy 2: Look for marked content with "Artifact" or "Watermark"
    () => {
      const artifactStart = content.indexOf('/Artifact')
      const watermarkStart = content.indexOf('/Watermark')

      if (artifactStart >= 0 || watermarkStart >= 0) {
        const start = artifactStart >= 0 ? artifactStart : watermarkStart
        // Find next EMC (end marked content)
        const emcEnd = content.indexOf('EMC', start)
        if (emcEnd > start) {
          // Look backwards for BMC/BDC (begin marked content)
          let actualStart = start
          for (let i = start - 1; i >= Math.max(0, start - 50); i--) {
            if (
              content.substring(i, i + 3) === 'BMC' ||
              content.substring(i, i + 3) === 'BDC'
            ) {
              actualStart = i - 20 // Include some context before
              break
            }
          }
          return { start: actualStart, end: emcEnd + 3 }
        }
      }
      return null
    },

    // Strategy 3: Look for graphics state with specific patterns
    () => {
      // Look for watermark-specific transformation matrices (often at start)
      const patterns = [
        '/Div <</MCID',
        '/GS',
        'BT', // Begin Text - might contain watermark text
      ]

      for (const pattern of patterns) {
        const idx = content.indexOf(pattern)
        if (idx >= 0) {
          // Check if this section contains watermark indicators
          const section = content.substring(
            Math.max(0, idx - 100),
            Math.min(content.length, idx + 500),
          )
          if (containsAprysWatermark(section, ['apryse', 'Apryse'])) {
            // Find reasonable end point
            const endMarkers = ['/Span', 'EMC', 'ET'] // End text, End marked content
            for (const endMarker of endMarkers) {
              const endIdx = content.indexOf(endMarker, idx)
              if (endIdx > idx) {
                return { start: Math.max(0, idx - 10), end: endIdx }
              }
            }
          }
        }
      }
      return null
    },
  ]

  // Try each strategy in order
  for (const strategy of strategies) {
    const result = strategy()
    if (result) return result
  }

  return null
}

/**
 * Remove Apryse watermark from PDF buffer
 *
 * This function removes Apryse watermarks (logo + "apryse" text) from PDF files by:
 * 1. Detecting and removing embedded watermark graphics in content streams
 * 2. Removing watermark overlay streams
 * 3. Handling various PDF structures including XFDF merged files
 *
 * @param pdfBuffer - Input PDF as Buffer
 * @param options - Optional configuration
 * @returns Result object with success status, stats, and clean PDF buffer
 *
 * @example
 * const result = await removeWatermark(pdfBuffer);
 * console.log(`Removed ${result.bytesRemoved} bytes of watermark`);
 */
export async function removeWatermark(
  pdfBuffer: Buffer,
  options: WatermarkRemovalOptions = {},
): Promise<WatermarkRemovalResult & { cleanPdfBuffer: Buffer }> {
  const { watermarkPatterns = ['apryse', 'Apryse', 'APRYSE'] } = options

  // Load PDF
  const pdfDoc = await PDFDocument.load(pdfBuffer)
  const context = pdfDoc.context

  const pages = pdfDoc.getPages()

  let totalBytesRemoved = 0
  let pagesProcessed = 0
  let totalWatermarksRemoved = 0

  // Process each page
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    const pageNode = page.node

    const contents = pageNode.lookup(PDFName.of('Contents'))
    const contentsArray = (contents as any).asArray
      ? (contents as any).asArray()
      : [contents]

    let pageWatermarkFound = false

    // Process ALL content streams (not just index 1) to find watermarks
    for (
      let streamIdx = 0;
      streamIdx < Math.min(contentsArray.length, 3);
      streamIdx++
    ) {
      const streamRef = contentsArray[streamIdx]
      const stream = context.lookup(streamRef)

      if (stream instanceof PDFStream) {
        try {
          // Decompress the stream
          const compressedBytes = (stream as any).contents
          const decompressed = await inflateAsync(Buffer.from(compressedBytes))
          let streamContent = decompressed.toString('latin1')

          // Check if this stream contains Apryse watermark
          if (!containsAprysWatermark(streamContent, watermarkPatterns)) {
            continue
          }

          const originalLength = streamContent.length

          // Find watermark boundaries using multiple strategies
          const boundaries = findWatermarkBoundaries(streamContent)

          if (boundaries) {
            // Remove watermark section
            const beforeWatermark = streamContent.substring(0, boundaries.start)
            const afterWatermark = streamContent.substring(boundaries.end)

            // Add a space to ensure proper PDF syntax
            streamContent = beforeWatermark + ' ' + afterWatermark

            const bytesRemoved = originalLength - streamContent.length
            totalBytesRemoved += bytesRemoved
            totalWatermarksRemoved++
            pageWatermarkFound = true

            // Recompress the modified content
            const newCompressed = await deflateAsync(
              Buffer.from(streamContent, 'latin1'),
            )

            // Update the stream
            ;(stream as any).contents = newCompressed
            stream.dict.set(
              PDFName.of('Length'),
              context.obj(newCompressed.length),
            )
          } else {
            // Fallback: If we detected watermark but can't find boundaries,
            // try removing from start to first content marker
            const safeMarkers = ['/Span <</MCID 1>>', 'EMC', 'ET']
            for (const marker of safeMarkers) {
              const markerIdx = streamContent.indexOf(marker)
              if (markerIdx > 0 && markerIdx < streamContent.length * 0.5) {
                // Only remove if marker is in first half of content (safety check)
                streamContent = ' q' + streamContent.substring(markerIdx)
                const bytesRemoved = originalLength - streamContent.length
                totalBytesRemoved += bytesRemoved
                totalWatermarksRemoved++
                pageWatermarkFound = true

                const newCompressed = await deflateAsync(
                  Buffer.from(streamContent, 'latin1'),
                )
                ;(stream as any).contents = newCompressed
                stream.dict.set(
                  PDFName.of('Length'),
                  context.obj(newCompressed.length),
                )
                break
              }
            }
          }
        } catch (error) {
          // Error processing stream - continue to next stream
        }
      }
    }

    if (pageWatermarkFound) {
      pagesProcessed++
    }

    // Selectively remove watermark overlay streams while preserving stamps and other content
    if (contentsArray.length > 3) {
      const streamsToKeep = contentsArray.slice(0, 3) // Always keep first 3 streams
      let overlayWatermarksRemoved = 0

      // Get page resources to analyze referenced XObjects
      const pageResources = pageNode.lookup(PDFName.of('Resources'))
      const pageXObjects = pageResources
        ? (pageResources as any).lookup(PDFName.of('XObject'))
        : null

      // Check each overlay stream (index 3+)
      for (let j = 3; j < contentsArray.length; j++) {
        const overlayRef = contentsArray[j]
        const overlayStream = context.lookup(overlayRef)

        if (overlayStream instanceof PDFStream) {
          try {
            // Decompress overlay stream to inspect content
            const overlayBytes = (overlayStream as any).contents
            const overlayDecompressed = await inflateAsync(
              Buffer.from(overlayBytes),
            )
            const overlayContent = overlayDecompressed.toString('latin1')

            // Check if this stream references an XObject (like /Fm0 Do, /Fm1 Do)
            const xobjMatch = overlayContent.match(/\/(Fm\d+|Im\d+)\s+Do/)
            let isWatermarkStream = false

            if (xobjMatch && pageXObjects) {
              // This stream references an XObject - check if it's a watermark
              const xobjName = xobjMatch[1]

              const xobjRef = (pageXObjects as any).lookup(PDFName.of(xobjName))
              if (xobjRef) {
                isWatermarkStream = await isWatermarkXObject(
                  xobjRef,
                  context,
                  watermarkPatterns,
                )
              }
            } else {
              // Check if the stream itself contains watermark patterns
              isWatermarkStream = containsAprysWatermark(
                overlayContent,
                watermarkPatterns,
              )
            }

            // Additional checks for content we should preserve
            const hasText =
              overlayContent.includes('BT') && overlayContent.includes('ET') // Begin/End Text

            if (isWatermarkStream && !hasText) {
              overlayWatermarksRemoved++
              totalWatermarksRemoved++
              // Don't add to streamsToKeep - this removes it
            } else {
              streamsToKeep.push(overlayRef)
            }
          } catch (error) {
            streamsToKeep.push(overlayRef) // Preserve if we can't analyze
          }
        } else {
          streamsToKeep.push(overlayRef) // Preserve non-stream references
        }
      }

      // Update page contents with only non-watermark streams
      if (overlayWatermarksRemoved > 0) {
        const newContents = context.obj(streamsToKeep)
        pageNode.set(PDFName.of('Contents'), newContents)
      }
    }
  }

  // Save the cleaned PDF
  const modifiedPdfBytes = await pdfDoc.save()
  const cleanPdfBuffer = Buffer.from(modifiedPdfBytes)

  const stats = {
    success: true,
    originalSize: pdfBuffer.length,
    cleanSize: cleanPdfBuffer.length,
    bytesRemoved: pdfBuffer.length - cleanPdfBuffer.length,
    pagesProcessed,
    totalPages: pages.length,
    watermarksRemoved: totalWatermarksRemoved,
    cleanPdfBuffer,
  }

  return stats
}
