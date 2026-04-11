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

// UnoServer Pool — singleton, warm LibreOffice daemon(lar), ~10x tezroq eski
// LibreOfficePool'dan. Host'da `unoserver` Python paketi bo'lishi shart
// (pip install unoserver).
//
// SDK v1.1.1'da multi-worker to'liq qo'llab-quvvatlanadi: har worker o'z RPC
// portiga (basePort+i, default 2003,2004,...) va o'z LibreOffice UNO socketiga
// (unoBasePort+i, default 2100,2101,...) ega bo'ladi.
let _pool: any = null
let _poolStartPromise: Promise<any> | null = null
async function getPool() {
  if (_pool) return _pool
  if (_poolStartPromise) return _poolStartPromise
  _poolStartPromise = (async () => {
    const { UnoServerPool } = await getSDK()
    const workers = Number(process.env.UNO_WORKERS ?? 2)
    const basePort = Number(process.env.UNO_BASE_PORT ?? 2003)
    const unoBasePort = Number(process.env.UNO_BASE_UNO_PORT ?? 2100)
    const pool = new UnoServerPool({
      workers,
      basePort,
      unoBasePort,
      convertTimeout: 60_000,
    })
    try {
      await pool.start()
    } catch (err: any) {
      // Broken pool'ni cache'da qoldirmaslik — keyingi chaqiriq qayta urinishi uchun
      logger.error(`UnoServer pool start failed: ${err?.message}`)
      try {
        await pool.stop?.()
      } catch {}
      _poolStartPromise = null
      throw err
    }
    _pool = pool
    _poolStartPromise = null
    logger.log(
      `UnoServer pool started (${workers} worker(s), rpc=${basePort}+, uno=${unoBasePort}+)`,
    )
    return pool
  })()
  return _poolStartPromise
}

/**
 * Pool'ni to'xtatish — graceful shutdown uchun `main.ts`'dan chaqiriladi.
 * Chaqirilmasa, daemon orphan bo'lib qoladi va port band bo'ladi.
 */
export async function stopPdfConverterPool(): Promise<void> {
  if (!_pool) return
  try {
    await _pool.stop()
    logger.log('UnoServer pool stopped')
  } catch (e: any) {
    logger.error(`UnoServer pool stop failed: ${e?.message}`)
  } finally {
    _pool = null
  }
}

/**
 * Health/readiness probe uchun pool statistikasi.
 * { workers, ready, busy, queued } qaytaradi.
 */
export function getPdfConverterPoolStats(): {
  workers: number
  ready: number
  busy: number
  queued: number
} | null {
  if (!_pool) return null
  try {
    return _pool.getStats()
  } catch {
    return null
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
   * Office hujjatni (DOCX/XLSX/PPTX) → PDF ga aylantirish.
   * UnoServerPool orqali — warm LibreOffice daemon'lar bilan ~200–500ms.
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
      const pool = await getPool()
      const start = Date.now()
      const pdfBuffer = await pool.convert(docxBuffer, 'pdf')
      logger.log(`PDF conversion: ${Date.now() - start}ms`)

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
