import { Logger } from '@nestjs/common'

const logger = new Logger('PdfConverter')

// ESM package — haqiqiy dynamic import kerak (TypeScript require() ga aylantirib yubormasligi uchun)
let _sdk: any = null
const importSDK = new Function('return import("@docverse-pdf/server")') as () => Promise<any>
async function getSDK() {
  if (!_sdk) {
    _sdk = await importSDK()
  }
  return _sdk
}

// Gotenberg client — stateless HTTP client. Start/stop yo'q, instance arzon —
// bitta singleton boot paytida yaratiladi va HTTP keep-alive'ni qayta ishlatadi.
// Docker konteyner: gotenberg/gotenberg:8 (odatda localhost:3001 yoki ichki
// service name:3000).
let _client: any = null
async function getClient() {
  if (_client) return _client
  const { GotenbergClient } = await getSDK()
  const url = process.env.GOTENBERG_URL || 'http://localhost:3001'
  const timeout = Number(process.env.GOTENBERG_TIMEOUT_MS ?? 120_000)
  _client = new GotenbergClient({ url, timeout })
  logger.log(`Gotenberg client initialized (url=${url}, timeout=${timeout}ms)`)
  return _client
}

/**
 * Gotenberg servisining mavjudligini tekshirish (readiness probe uchun).
 * Boot vaqtida ogohlantirish va /healthz endpoint uchun ishlatilishi mumkin.
 */
export async function pingGotenberg(timeoutMs = 3000): Promise<boolean> {
  try {
    const client = await getClient()
    return await client.ping(timeoutMs)
  } catch {
    return false
  }
}

/**
 * Boot vaqtida Gotenberg client'ni lazy-init qilish va health check qilish.
 * Muvaffaqiyatsiz bo'lsa ham throw qilmaydi — boshqa API endpointlari ishlayveradi,
 * faqat PDF konversiyalari fail bo'ladi. Konsolga warning chiqariladi.
 */
export async function warmPdfConverter(): Promise<void> {
  try {
    const ok = await pingGotenberg(5000)
    if (ok) {
      logger.log('Gotenberg is reachable — PDF conversion ready')
    } else {
      logger.warn(
        'Gotenberg is NOT reachable — PDF conversions will fail. Check GOTENBERG_URL and container status.',
      )
    }
  } catch (e: any) {
    logger.warn(`Gotenberg warmup failed: ${e?.message}`)
  }
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
   * Office hujjatni (DOCX/XLSX/PPTX/ODT/RTF/...) → PDF ga aylantirish.
   * Gotenberg (LibreOffice route) orqali — HTTP multipart POST.
   */
  static async convertDocxToPdf(
    docxBuffer: Buffer,
    originalFileName: string,
  ): Promise<ConversionResult> {
    const pdfFileName = originalFileName.replace(
      /\.(docx|doc|xlsx|xls|pptx|ppt|odt|rtf)$/i,
      '.pdf',
    )

    const inKB = (docxBuffer.length / 1024).toFixed(1)
    const t0 = Date.now()
    try {
      logger.log(`[docx→pdf] START file="${originalFileName}" size=${inKB}KB`)

      const tClientStart = Date.now()
      const client = await getClient()
      const tClient = Date.now() - tClientStart

      const tConvStart = Date.now()
      const pdfBuffer = await client.convert(docxBuffer, {
        filename: originalFileName,
      })
      const tConv = Date.now() - tConvStart

      const outKB = (pdfBuffer.length / 1024).toFixed(1)
      const total = Date.now() - t0
      logger.log(
        `[docx→pdf] DONE file="${originalFileName}" ` +
          `in=${inKB}KB → out=${outKB}KB ` +
          `| client.acquire=${tClient}ms convert=${tConv}ms total=${total}ms`,
      )

      return {
        pdfBuffer: Buffer.from(pdfBuffer),
        fileName: pdfFileName,
      }
    } catch (error: any) {
      const total = Date.now() - t0
      logger.error(
        `[docx→pdf] FAIL file="${originalFileName}" in=${inKB}KB total=${total}ms error=${error?.message}`,
      )
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

    const pdfKB = (pdfBuffer.length / 1024).toFixed(1)
    const xfdfKB = (xfdfBuffer.length / 1024).toFixed(1)
    const t0 = Date.now()
    try {
      logger.log(
        `[xfdf-merge] START file="${originalFileName}" pdf=${pdfKB}KB xfdf=${xfdfKB}KB`,
      )

      const tSdkStart = Date.now()
      const { flattenXFDF } = await getSDK()
      const tSdk = Date.now() - tSdkStart

      const xfdfString = xfdfBuffer.toString('utf-8')

      const tMergeStart = Date.now()
      const mergedPdf = await flattenXFDF(pdfBuffer, xfdfString)
      const tMerge = Date.now() - tMergeStart

      const outKB = (mergedPdf.length / 1024).toFixed(1)
      const total = Date.now() - t0
      logger.log(
        `[xfdf-merge] DONE file="${originalFileName}" ` +
          `pdf=${pdfKB}KB + xfdf=${xfdfKB}KB → out=${outKB}KB ` +
          `| sdk.load=${tSdk}ms merge=${tMerge}ms total=${total}ms`,
      )

      return {
        pdfBuffer: Buffer.from(mergedPdf),
        fileName: cleanName,
      }
    } catch (error: any) {
      const total = Date.now() - t0
      logger.error(
        `[xfdf-merge] FAIL file="${originalFileName}" pdf=${pdfKB}KB xfdf=${xfdfKB}KB total=${total}ms error=${error?.message}`,
      )
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
