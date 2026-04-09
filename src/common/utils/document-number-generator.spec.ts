import { DocumentNumberGenerator } from './document-number-generator.util'

/**
 * UNIT test — DocumentNumberGenerator pure logic.
 * DB chaqirilmaydi (private static metodlar testlanadi).
 */
describe('DocumentNumberGenerator (unit)', () => {
  describe('hasSequencePlaceholder', () => {
    const cases: Array<[string, boolean]> = [
      ['{prefix}-{year}-{sequence}', true],
      ['{prefix}-{year}-{seq}', true],
      ['{prefix}-{year}-{NUMBER}', true],
      ['{prefix}-{year}-{NUMBER:5}', true],
      ['{PREFIX}-{YEAR}-{NUMBER:4}', true],
      ['{prefix}-{year}', false],
      ['only-text', false],
      ['', false],
    ]
    test.each(cases)("hasSequencePlaceholder(%s) === %s", (input, expected) => {
      // private — accessing via any
      const result = (DocumentNumberGenerator as any).hasSequencePlaceholder(input)
      expect(result).toBe(expected)
    })
  })

  describe('buildNumber', () => {
    const date = new Date('2026-04-09T12:00:00Z')

    it('{prefix}-{year}-{NUMBER:4} format', () => {
      const result = (DocumentNumberGenerator as any).buildNumber(
        { prefix: 'IB', format: '{prefix}-{year}-{NUMBER:4}' },
        date,
        7,
      )
      expect(result).toBe('IB-2026-0007')
    })

    it('{prefix}-{yy}-{seq}', () => {
      const result = (DocumentNumberGenerator as any).buildNumber(
        { prefix: 'KH', format: '{prefix}-{yy}-{seq}' },
        date,
        12,
      )
      expect(result).toBe('KH-26-012')
    })

    it('{prefix}-{date}-{NUMBER:3}', () => {
      const result = (DocumentNumberGenerator as any).buildNumber(
        { prefix: 'IZ', format: '{prefix}-{date}-{NUMBER:3}' },
        date,
        5,
      )
      expect(result).toBe('IZ-20260409-005')
    })

    it('Sequence padding', () => {
      const result = (DocumentNumberGenerator as any).buildNumber(
        { prefix: 'X', format: '{prefix}-{NUMBER:6}' },
        date,
        42,
      )
      expect(result).toBe('X-000042')
    })

    it('Case insensitive placeholders', () => {
      const result = (DocumentNumberGenerator as any).buildNumber(
        { prefix: 'A', format: '{PREFIX}-{YEAR}-{NUMBER:4}' },
        date,
        1,
      )
      expect(result).toBe('A-2026-0001')
    })
  })

  describe('buildPrefix', () => {
    const date = new Date('2026-04-09T12:00:00Z')

    it('NUMBER:N gacha bo\'lgan qism', () => {
      const result = (DocumentNumberGenerator as any).buildPrefix(
        { prefix: 'IB', format: '{prefix}-{year}-{NUMBER:4}' },
        date,
      )
      expect(result).toBe('IB-2026-')
    })

    it('seq gacha', () => {
      const result = (DocumentNumberGenerator as any).buildPrefix(
        { prefix: 'KH', format: '{prefix}-{yy}-{seq}' },
        date,
      )
      expect(result).toBe('KH-26-')
    })

    it('Date placeholder', () => {
      const result = (DocumentNumberGenerator as any).buildPrefix(
        { prefix: 'IZ', format: '{prefix}-{date}-{NUMBER:3}' },
        date,
      )
      expect(result).toBe('IZ-20260409-')
    })
  })

  describe('validateFormat', () => {
    it('Valid format', () => {
      const result = DocumentNumberGenerator.validateFormat(
        '{prefix}-{year}-{NUMBER:4}',
      )
      expect(result.valid).toBe(true)
    })

    it("Bo'sh format → invalid", () => {
      const result = DocumentNumberGenerator.validateFormat('')
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it("Placeholder yo'q → invalid", () => {
      const result = DocumentNumberGenerator.validateFormat('plain-text')
      expect(result.valid).toBe(false)
    })

    it("Sequence yo'q → warning lekin valid", () => {
      const result = DocumentNumberGenerator.validateFormat('{prefix}-{year}')
      // Faqat warning, valid = true
      expect(result.errors.some((e) => e.startsWith('Warning:'))).toBe(true)
    })
  })
})
