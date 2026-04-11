/**
 * In-memory cache for pre-converted PDF metadata.
 *
 * Problem: when a user uploads a DOCX attachment, the file is uploaded to a
 * remote MinIO CDN (~2–10s for large files). Later, when the user creates a
 * document and links that attachment, the backend re-downloads the DOCX from
 * MinIO and converts it to PDF via Gotenberg — wasting the same network time
 * twice.
 *
 * Solution: at attachment upload time (when the Buffer is still in memory),
 * we convert DOCX → PDF in parallel with the MinIO upload, upload the PDF to
 * MinIO as well, and stash its URL in this process-local cache keyed by
 * attachment ID. When the document create flow later runs
 * `convertDocxToPdfForDocument`, it pops the cache first — if the entry is
 * fresh, it reuses the already-uploaded PDF URL and skips the MinIO download
 * + Gotenberg round-trip entirely.
 *
 * On cache miss (backend restarted, TTL expired, different process) the
 * caller falls back to the original MinIO-download path — so behaviour is
 * always correct, just sometimes slower.
 */

export interface CachedPdf {
  pdfUrl: string
  pdfFileName: string
  pdfFileSize: number
}

interface CacheEntry {
  data: CachedPdf
  expiresAt: number
}

const TTL_MS = 10 * 60 * 1000 // 10 daqiqa — upload va docCreate orasidagi real oraliqdan ancha ko'p
const cache = new Map<string, CacheEntry>()

export function setCachedPdf(attachmentId: string, data: CachedPdf): void {
  cache.set(attachmentId, { data, expiresAt: Date.now() + TTL_MS })
}

/**
 * Get-and-delete — cache entry bir marta ishlatiladi, keyin tozalanadi.
 * Expired entry topilsa ham yo'qotiladi va null qaytadi.
 */
export function popCachedPdf(attachmentId: string): CachedPdf | null {
  const entry = cache.get(attachmentId)
  if (!entry) return null
  cache.delete(attachmentId)
  if (entry.expiresAt < Date.now()) return null
  return entry.data
}

export function cacheStats(): { size: number } {
  return { size: cache.size }
}

// Periodik tozalash — stale entrylar memory'da turib qolmasligi uchun.
// Har 5 daqiqada bir marta ishlab, TTL o'tgan yozuvlarni olib tashlaydi.
setInterval(
  () => {
    const now = Date.now()
    for (const [id, entry] of cache.entries()) {
      if (entry.expiresAt < now) cache.delete(id)
    }
  },
  5 * 60 * 1000,
).unref()
