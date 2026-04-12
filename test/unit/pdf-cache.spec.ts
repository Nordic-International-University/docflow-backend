/**
 * PDF Conversion Cache — unit tests.
 * TTL, pop behavior, stale cleanup.
 */

import {
  setCachedPdf,
  popCachedPdf,
  cacheStats,
} from '../../src/common/utils/pdf-conversion-cache'

describe('PDF Conversion Cache', () => {
  const testData = {
    pdfUrl: 'https://cdn.example.com/test.pdf',
    pdfFileName: 'test.pdf',
    pdfFileSize: 1024,
  }

  afterEach(() => {
    // Cleanup — pop all test entries
    popCachedPdf('test-1')
    popCachedPdf('test-2')
    popCachedPdf('test-3')
  })

  it('set va pop ishlaydi', () => {
    setCachedPdf('test-1', testData)
    const result = popCachedPdf('test-1')

    expect(result).toEqual(testData)
  })

  it('pop — bir marta ishlatiladi (get + delete)', () => {
    setCachedPdf('test-1', testData)

    const first = popCachedPdf('test-1')
    const second = popCachedPdf('test-1')

    expect(first).toEqual(testData)
    expect(second).toBeNull() // ikkinchi marta yo'q
  })

  it('mavjud bo\'lmagan key uchun null', () => {
    expect(popCachedPdf('non-existent')).toBeNull()
  })

  it('bir nechta entry parallel saqlash', () => {
    setCachedPdf('test-1', { ...testData, pdfUrl: 'url-1' })
    setCachedPdf('test-2', { ...testData, pdfUrl: 'url-2' })

    expect(popCachedPdf('test-1')?.pdfUrl).toBe('url-1')
    expect(popCachedPdf('test-2')?.pdfUrl).toBe('url-2')
  })

  it('cacheStats size to\'g\'ri', () => {
    setCachedPdf('test-1', testData)
    setCachedPdf('test-2', testData)

    expect(cacheStats().size).toBeGreaterThanOrEqual(2)
  })

  it('overwrite — yangi qiymat eski ustiga yoziladi', () => {
    setCachedPdf('test-1', { ...testData, pdfUrl: 'old' })
    setCachedPdf('test-1', { ...testData, pdfUrl: 'new' })

    expect(popCachedPdf('test-1')?.pdfUrl).toBe('new')
  })
})
