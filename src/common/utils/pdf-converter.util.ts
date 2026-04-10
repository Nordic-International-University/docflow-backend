import { Logger } from '@nestjs/common'

const logger = new Logger('PdfConverter')

// ESM package — dynamic import kerak (CJS proyektda)
let _sdk: any = null
async function getSDK() {
  if (!_sdk) {
    _sdk = await import('@docverse-pdf/server')
  }
  return _sdk
}

export interface ConversionResult {
  pdfBuffer: Buffer
  fileName: string
}

/**
 * PDF konvertatsiya va XFDF merge utility.
 *
 * DocVerse PDF Server SDK ishlatadi (@docverse-pdf/server).
 * PDFTron o'rniga — yengilroq, WASM-based, temp fayl kerak emas.
 */
export class PdfConverterUtil {
  /**
   * Office hujjatni (DOCX/XLSX/PPTX) → PDF ga aylantirish.
   * DocVerse wordToPDF funksiyasi — LibreOffice kerak emas.
   */
  static async convertDocxToPdf(
    docxBuffer: Buffer,
    originalFileName: string,
  ): Promise<ConversionResult> {
    const pdfFileName = originalFileName.replace(
      /\.(docx|doc|xlsx|xls|pptx|ppt)$/i,
      '.pdf',
    )

    try {
      logger.log(`Converting to PDF: ${originalFileName}`)
      const { wordToPDF } = await getSDK()
      // LibreOffice listener mode (port 2002) — 10x tez
      const pdfBuffer = await wordToPDF(docxBuffer, {
        socketUrl: 'socket,host=127.0.0.1,port=2002;urp;',
      })

      logger.log(`PDF conversion done: ${pdfBuffer.length} bytes`)

      return {
        pdfBuffer: Buffer.from(pdfBuffer),
        fileName: pdfFileName,
      }
    } catch (error: any) {
      logger.error(`PDF conversion failed: ${error.message}`)
      throw new Error(`Failed to convert to PDF: ${error.message}`)
    }
  }

  /**
   * XFDF annotatsiyalarni PDF ichiga birlashtirish va flatten qilish.
   * DocVerse flattenXFDF funksiyasi — temp fayl kerak emas, memory'da ishlaydi.
   */
  static async mergeXfdfToPdf(
    pdfBuffer: Buffer,
    xfdfBuffer: Buffer,
    originalFileName: string,
  ): Promise<ConversionResult> {
    const cleanName = originalFileName.replace(/^(merged-)+/g, '')

    try {
      logger.log(`XFDF merge: ${originalFileName}`)
      const { flattenXFDF } = await getSDK()
      const xfdfString = xfdfBuffer.toString('utf-8')
      const mergedPdf = await flattenXFDF(pdfBuffer, xfdfString)

      logger.log(`XFDF merged: ${mergedPdf.length} bytes`)

      return {
        pdfBuffer: Buffer.from(mergedPdf),
        fileName: cleanName,
      }
    } catch (error: any) {
      logger.error(`XFDF merge failed: ${error.message}`)
      throw new Error(`Failed to merge XFDF: ${error.message}`)
    }
  }

  /**
   * PDF'ga watermark qo'shish.
   */
  static async addWatermark(
    pdfBuffer: Buffer,
    text: string,
    options?: { fontSize?: number; rotation?: number; opacity?: number },
  ): Promise<Buffer> {
    try {
      const { PDFDocument } = await getSDK()
      const doc = await PDFDocument.load(pdfBuffer)
      doc.addWatermark(text, {
        fontSize: options?.fontSize || 48,
        rotation: options?.rotation || 45,
        r: 200,
        g: 200,
        b: 200,
        a: options?.opacity ? Math.round(options.opacity * 255) : 80,
      })
      const result = doc.save()
      doc.close()
      return Buffer.from(result)
    } catch (error: any) {
      logger.error(`Watermark failed: ${error.message}`)
      throw error
    }
  }

  /**
   * PDF sahifalar sonini olish.
   */
  static async getPageCount(pdfBuffer: Buffer): Promise<number> {
    const { PDFDocument } = await getSDK()
    const doc = await PDFDocument.load(pdfBuffer)
    const count = doc.getPageCount()
    doc.close()
    return count
  }

  /**
   * PDF'dan matn ajratib olish.
   */
  static async extractText(pdfBuffer: Buffer, pageIndex = 0): Promise<string> {
    const { PDFDocument } = await getSDK()
    const doc = await PDFDocument.load(pdfBuffer)
    const text = doc.extractText(pageIndex)
    doc.close()
    return text
  }

  /**
   * PDF sahifani PNG rasmga aylantirish (thumbnail uchun).
   */
  static async renderPageToPng(
    pdfBuffer: Buffer,
    pageIndex = 0,
    width = 300,
  ): Promise<Buffer> {
    const { PDFDocument } = await getSDK()
    const doc = await PDFDocument.load(pdfBuffer)
    const png = await doc.generateThumbnail(pageIndex, width, 'png', 90)
    doc.close()
    return png
  }

  /**
   * Imzolarni tekshirish.
   */
  static async verifySignatures(pdfBuffer: Buffer) {
    const { PDFDocument } = await getSDK()
    const doc = await PDFDocument.load(pdfBuffer)
    const count = doc.getSignatureCount()
    const results = []
    for (let i = 0; i < count; i++) {
      results.push(doc.verifySignature(i, pdfBuffer))
    }
    doc.close()
    return { count, results, tampered: results.some((r) => !r.integrityValid) }
  }

  /**
   * PDF'ga elektron imzo qo'yish.
   */
  static async signPdf(
    pdfBuffer: Buffer,
    options: {
      cert: string
      key: string
      reason?: string
      location?: string
      pageIndex?: number
      rect?: { left: number; bottom: number; right: number; top: number }
    },
  ): Promise<Buffer> {
    const { PDFDocument } = await getSDK()
    const doc = await PDFDocument.load(pdfBuffer)
    const signed = await doc.sign({
      cert: options.cert,
      key: options.key,
      reason: options.reason || 'Tasdiqlandi',
      location: options.location || 'Tashkent, Uzbekistan',
      pageIndex: options.pageIndex || 0,
      rect: options.rect || { left: 50, bottom: 50, right: 250, top: 120 },
    })
    doc.close()
    return Buffer.from(signed)
  }
}
