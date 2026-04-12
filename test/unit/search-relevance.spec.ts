/**
 * Search Relevance Scoring — unit tests.
 * Score hisoblash to'g'riligini tekshirish.
 */

jest.mock('@prisma/client', () => ({}), { virtual: true })
jest.mock('@prisma', () => ({ PrismaService: class {} }), { virtual: true })
jest.mock('@clients', () => ({ MinioService: class {} }), { virtual: true })

import { SearchService } from '../../src/modules/search/search.service'

describe('Search Relevance Scoring', () => {
  let service: SearchService

  beforeAll(() => {
    service = new SearchService({} as any)
  })

  // Access private method for testing
  const calcRelevance = (query: string, title?: string, desc?: string) => {
    return (service as any).calculateRelevance(query, title, desc)
  }

  it('aniq mos (exact match) — eng yuqori score', () => {
    const score = calcRelevance('shartnoma', 'shartnoma', null)
    expect(score).toBe(100)
  })

  it('boshidan mos (starts with) — yuqori score', () => {
    const score = calcRelevance('shart', 'shartnoma yaratish', null)
    expect(score).toBe(80)
  })

  it('ichida bor (contains) — o\'rta score', () => {
    const score = calcRelevance('yaratish', 'shartnoma yaratish', null)
    expect(score).toBe(50)
  })

  it('description ichida — past score', () => {
    const score = calcRelevance('server', null, 'Yangi server sotib olish')
    expect(score).toBe(20)
  })

  it('title + description — birlashtirilgan score', () => {
    const score = calcRelevance(
      'server',
      'Server sotib olish',
      'Yangi server jihozlari talab qilinadi',
    )
    // title contains (50) + description contains (20) = 70
    expect(score).toBe(70)
  })

  it('topilmasa — 0 score', () => {
    const score = calcRelevance('hello', 'shartnoma', 'server sotib olish')
    expect(score).toBe(0)
  })

  it('case insensitive', () => {
    const score = calcRelevance('SHARTNOMA', 'shartnoma yaratish', null)
    expect(score).toBeGreaterThan(0)
  })

  it('null title va description — 0 score', () => {
    const score = calcRelevance('test', null, null)
    expect(score).toBe(0)
  })

  it('empty string — 0 score', () => {
    const score = calcRelevance('test', '', '')
    expect(score).toBe(0)
  })

  // Snippet extraction
  const extractSnippet = (content: string, query: string) => {
    return (service as any).extractSnippet(content, query)
  }

  it('snippet — query atrofidagi kontekst', () => {
    const content = 'Bu juda uzun matn. Server jihozlarini sotib olish kerak. Boshqa gap.'
    const snippet = extractSnippet(content, 'sotib')
    expect(snippet).toContain('sotib')
    expect(snippet!.length).toBeLessThan(content.length)
  })

  it('snippet — boshida ... qo\'shadi', () => {
    const content = 'A'.repeat(200) + ' qidiruv so\'zi ' + 'B'.repeat(200)
    const snippet = extractSnippet(content, 'qidiruv')
    expect(snippet).toStartWith('...')
  })

  it('snippet — topilmasa null', () => {
    const snippet = extractSnippet('Bu matn', 'yo\'q')
    expect(snippet).toBeNull()
  })

  it('snippet — null content', () => {
    const snippet = extractSnippet(null as any, 'test')
    expect(snippet).toBeNull()
  })
})

// Custom matcher
expect.extend({
  toStartWith(received: string, expected: string) {
    const pass = received.startsWith(expected)
    return {
      pass,
      message: () => `Expected "${received}" to start with "${expected}"`,
    }
  },
})

declare global {
  namespace jest {
    interface Matchers<R> {
      toStartWith(expected: string): R
    }
  }
}
