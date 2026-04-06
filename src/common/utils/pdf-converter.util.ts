let PDFNet: any
try {
  PDFNet = require('@pdftron/pdfnet-node').PDFNet
} catch {
  PDFNet = null
}
import { Logger } from '@nestjs/common'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'

const logger = new Logger('PdfConverter')

export interface ConversionResult {
  pdfBuffer: Buffer
  fileName: string
}

export class PdfConverterUtil {
  private static pdftronInitialized = false

  private static async ensurePDFTronInitialized(): Promise<void> {
    if (!PDFNet) {
      throw new Error('PDFTron is not available on this system')
    }
    if (!this.pdftronInitialized) {
      await PDFNet.initialize(
        'demo:1762777177081:601eabe40300000000e42ddd407e894dff6198482ac17897bce606c4a2',
      )
      this.pdftronInitialized = true
      logger.log('PDFTron initialized successfully')
    }
  }

  static async convertDocxToPdf(
    docxBuffer: Buffer,
    originalFileName: string,
  ): Promise<ConversionResult> {
    await this.ensurePDFTronInitialized()

    const pdfFileName = originalFileName.replace(
      /\.(docx|doc|xlsx|xls|pptx|ppt)$/i,
      '.pdf',
    )

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'office-convert-'))
    const inputPath = path.join(tempDir, originalFileName)
    const outputPath = path.join(tempDir, pdfFileName)

    try {
      logger.log(
        `[PDFTron] Starting Office to PDF conversion for: ${originalFileName}`,
      )

      // Write input buffer to temporary file
      await fs.writeFile(inputPath, docxBuffer)
      logger.log('[PDFTron] Input file written to temporary path')

      // Convert Office document to PDF using PDFTron
      await PDFNet.runWithCleanup(async () => {
        const pdfdoc = await PDFNet.PDFDoc.create()
        await pdfdoc.initSecurityHandler()

        // Use Convert class to convert Office formats to PDF
        await PDFNet.Convert.toPdf(pdfdoc, inputPath)

        await pdfdoc.save(outputPath, PDFNet.SDFDoc.SaveOptions.e_linearized)
        logger.log(`[PDFTron] Office document converted to PDF: ${outputPath}`)
      })

      // Read the converted PDF file
      const pdfBuffer = await fs.readFile(outputPath)
      logger.log(
        `[PDFTron] PDF conversion successful, size: ${pdfBuffer.length} bytes`,
      )

      return {
        pdfBuffer,
        fileName: pdfFileName,
      }
    } catch (error) {
      logger.error(`[PDFTron] Error converting Office to PDF: ${error.message}`)
      logger.error(`[PDFTron] Error stack: ${error.stack}`)
      throw new Error(`Failed to convert Office to PDF: ${error.message}`)
    } finally {
      // Clean up temporary files
      try {
        await fs.rm(tempDir, { recursive: true, force: true })
        logger.log(`[PDFTron] Temporary directory cleaned up: ${tempDir}`)
      } catch (cleanupError) {
        logger.warn(
          `[PDFTron] Failed to clean up temporary directory: ${cleanupError.message}`,
        )
      }
    }
  }

  static async mergeXfdfToPdf(
    pdfBuffer: Buffer,
    xfdfBuffer: Buffer,
    originalFileName: string,
  ): Promise<ConversionResult> {
    await this.ensurePDFTronInitialized()

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'xfdf-merge-'))
    const pdfPath = path.join(tempDir, originalFileName)
    const xfdfPath = path.join(tempDir, 'annotations.xfdf')
    const outputPdfPath = path.join(tempDir, `merged-${originalFileName}`)

    try {
      logger.log(`Starting XFDF merge for: ${originalFileName}`)

      // Write buffers to temporary files
      await fs.writeFile(pdfPath, pdfBuffer)
      await fs.writeFile(xfdfPath, xfdfBuffer)
      logger.log('PDF and XFDF files written to temporary paths')

      // Merge XFDF annotations into PDF using PDFTron
      await PDFNet.runWithCleanup(async () => {
        const pdfdoc = await PDFNet.PDFDoc.createFromFilePath(pdfPath)
        await pdfdoc.initSecurityHandler()

        // Import XFDF annotations
        const fdfDoc = await PDFNet.FDFDoc.createFromXFDF(xfdfPath)
        await pdfdoc.fdfMerge(fdfDoc)

        // Flatten annotations to make them part of the PDF content
        await pdfdoc.flattenAnnotations()

        await pdfdoc.save(outputPdfPath, PDFNet.SDFDoc.SaveOptions.e_linearized)
        logger.log(`XFDF merged into PDF successfully: ${outputPdfPath}`)
      })

      // Read the merged PDF file
      const mergedPdfBuffer = await fs.readFile(outputPdfPath)
      logger.log(
        `Merged PDF buffer read successfully, size: ${mergedPdfBuffer.length} bytes`,
      )

      return {
        pdfBuffer: mergedPdfBuffer,
        fileName: `merged-${originalFileName}`,
      }
    } catch (error) {
      logger.error(`Error merging XFDF to PDF: ${error.message}`)
      logger.error(`Error stack: ${error.stack}`)
      throw new Error(`Failed to merge XFDF to PDF: ${error.message}`)
    } finally {
      // Clean up temporary files
      try {
        await fs.rm(tempDir, { recursive: true, force: true })
        logger.log(`Temporary directory cleaned up: ${tempDir}`)
      } catch (cleanupError) {
        logger.warn(
          `Failed to clean up temporary directory: ${cleanupError.message}`,
        )
      }
    }
  }
}
