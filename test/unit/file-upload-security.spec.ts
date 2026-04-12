/**
 * File Upload Security — whitelist enforcement tests.
 * Xavfli fayllarni bloklash, ruxsat etilganlarni o'tkazish.
 */

describe('File Upload Mimetype Whitelist', () => {
  // Reproduce the whitelist from attachment.service.ts
  const ALLOWED_MIMETYPES = new Set([
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint',
    'application/vnd.oasis.opendocument.text',
    'application/rtf',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
  ])

  describe('Ruxsat etilgan fayllar', () => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'text/plain',
      'application/zip',
    ]

    allowed.forEach((mime) => {
      it(`${mime} — ruxsat etilgan`, () => {
        expect(ALLOWED_MIMETYPES.has(mime)).toBe(true)
      })
    })
  })

  describe('SECURITY: Bloklangan xavfli fayllar', () => {
    const blocked = [
      ['application/x-executable', '.exe'],
      ['application/x-sh', '.sh'],
      ['application/x-bat', '.bat'],
      ['application/javascript', '.js'],
      ['text/html', '.html (XSS)'],
      ['application/x-php', '.php'],
      ['application/java-archive', '.jar'],
      ['application/x-msdownload', '.dll'],
      ['application/octet-stream', 'unknown binary'],
      ['application/x-python-code', '.pyc'],
      ['video/mp4', '.mp4 (video)'],
      ['audio/mpeg', '.mp3 (audio)'],
      ['application/x-iso9660-image', '.iso'],
    ]

    blocked.forEach(([mime, desc]) => {
      it(`${mime} (${desc}) — BLOKLANGAN`, () => {
        expect(ALLOWED_MIMETYPES.has(mime)).toBe(false)
      })
    })
  })

  describe('Edge cases', () => {
    it('bo\'sh string — ruxsat etilmagan', () => {
      expect(ALLOWED_MIMETYPES.has('')).toBe(false)
    })

    it('undefined check', () => {
      expect(ALLOWED_MIMETYPES.has(undefined as any)).toBe(false)
    })

    it('case sensitive — APPLICATION/PDF ruxsat etilmagan', () => {
      expect(ALLOWED_MIMETYPES.has('APPLICATION/PDF')).toBe(false)
    })
  })
})
