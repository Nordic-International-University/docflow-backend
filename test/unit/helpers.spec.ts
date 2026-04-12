/**
 * Helper functions — unit tests.
 * bestEffort, pagination, role helpers.
 */

import {
  bestEffort,
  bestEffortWithRetry,
} from '../../src/common/helpers/best-effort.helper'
import { parsePagination } from '../../src/common/helpers/pagination.helper'
import {
  isAdmin,
  isSuperAdmin,
  isHR,
  isAdminOrHR,
} from '../../src/common/helpers/role.helper'

// ═══════════════════════════════════════════════════
// BEST EFFORT
// ═══════════════════════════════════════════════════

describe('bestEffort', () => {
  const mockLogger = { warn: jest.fn() }

  beforeEach(() => mockLogger.warn.mockClear())

  it('muvaffaq bo\'lganda natija qaytaradi', async () => {
    const result = await bestEffort(
      () => Promise.resolve(42),
      'test',
      mockLogger,
    )
    expect(result).toBe(42)
    expect(mockLogger.warn).not.toHaveBeenCalled()
  })

  it('xatoda undefined qaytaradi va log yozadi', async () => {
    const result = await bestEffort(
      () => Promise.reject(new Error('boom')),
      'failing op',
      mockLogger,
    )
    expect(result).toBeUndefined()
    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining('[best-effort] failing op failed: boom'),
      expect.anything(),
    )
  })

  it('throw qilmaydi — caller davom etadi', async () => {
    const fn = async () => {
      await bestEffort(
        () => Promise.reject(new Error('crash')),
        'ctx',
        mockLogger,
      )
      return 'continued'
    }
    expect(await fn()).toBe('continued')
  })
})

describe('bestEffortWithRetry', () => {
  const mockLogger = { warn: jest.fn() }

  beforeEach(() => mockLogger.warn.mockClear())

  it('birinchi urinishda muvaffaq', async () => {
    let attempts = 0
    const result = await bestEffortWithRetry(
      () => {
        attempts++
        return Promise.resolve('ok')
      },
      'retry test',
      mockLogger,
      { retries: 3, delayMs: 10 },
    )
    expect(result).toBe('ok')
    expect(attempts).toBe(1)
  })

  it('ikkinchi urinishda muvaffaq', async () => {
    let attempts = 0
    const result = await bestEffortWithRetry(
      () => {
        attempts++
        if (attempts < 2) throw new Error('transient')
        return Promise.resolve('recovered')
      },
      'retry test',
      mockLogger,
      { retries: 3, delayMs: 10 },
    )
    expect(result).toBe('recovered')
    expect(attempts).toBe(2)
    expect(mockLogger.warn).not.toHaveBeenCalled()
  })

  it('barcha urinishlar muvaffaqiyatsiz', async () => {
    let attempts = 0
    const result = await bestEffortWithRetry(
      () => {
        attempts++
        return Promise.reject(new Error('permanent'))
      },
      'always fail',
      mockLogger,
      { retries: 3, delayMs: 10 },
    )
    expect(result).toBeUndefined()
    expect(attempts).toBe(3)
    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining('failed after 3 attempts'),
      expect.anything(),
    )
  })
})

// ═══════════════════════════════════════════════════
// PAGINATION
// ═══════════════════════════════════════════════════

describe('parsePagination', () => {
  it('default qiymatlari', () => {
    const result = parsePagination({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(10)
    expect(result.skip).toBe(0)
  })

  it('custom qiymatlar', () => {
    const result = parsePagination({ pageNumber: 3, pageSize: 25 })
    expect(result.page).toBe(3)
    expect(result.limit).toBe(25)
    expect(result.skip).toBe(50)
  })

  it('string parametrlar (query'dan)', () => {
    const result = parsePagination({ pageNumber: '2', pageSize: '15' })
    expect(result.page).toBe(2)
    expect(result.limit).toBe(15)
  })

  it('SECURITY: limit 100 dan oshmasligi (DoS prevention)', () => {
    const result = parsePagination({ pageSize: 999999 })
    expect(result.limit).toBeLessThanOrEqual(100)
  })

  it('SECURITY: limit 0 yoki manfiy bolmasligi', () => {
    const result = parsePagination({ pageSize: -5 })
    expect(result.limit).toBeGreaterThanOrEqual(1)
  })

  it('SECURITY: page 0 yoki manfiy bolmasligi', () => {
    const result = parsePagination({ pageNumber: -1 })
    expect(result.page).toBeGreaterThanOrEqual(1)
  })

  it('NaN handling', () => {
    const result = parsePagination({
      pageNumber: 'abc' as any,
      pageSize: 'xyz' as any,
    })
    expect(result.page).toBeGreaterThanOrEqual(1)
    expect(result.limit).toBeGreaterThanOrEqual(1)
  })

  it('page/limit alternative keys', () => {
    const result = parsePagination({ page: 5, limit: 30 })
    expect(result.page).toBe(5)
    expect(result.limit).toBe(30)
  })
})

// ═══════════════════════════════════════════════════
// ROLE HELPERS
// ═══════════════════════════════════════════════════

describe('Role helpers', () => {
  describe('isAdmin', () => {
    it('System Administrator = true', () => {
      expect(isAdmin('System Administrator')).toBe(true)
    })

    it('Admin = true', () => {
      expect(isAdmin('Admin')).toBe(true)
    })

    it('Employee = false', () => {
      expect(isAdmin('Employee')).toBe(false)
    })

    it('HR Manager = false', () => {
      expect(isAdmin('HR Manager')).toBe(false)
    })

    it('undefined = false', () => {
      expect(isAdmin(undefined)).toBe(false)
    })

    it('null = false', () => {
      expect(isAdmin(null)).toBe(false)
    })

    it('empty string = false', () => {
      expect(isAdmin('')).toBe(false)
    })

    it('case sensitive — admin (lowercase) = false', () => {
      expect(isAdmin('admin')).toBe(false)
    })
  })

  describe('isSuperAdmin', () => {
    it('System Administrator = true', () => {
      expect(isSuperAdmin('System Administrator')).toBe(true)
    })

    it('Admin = false (not super)', () => {
      expect(isSuperAdmin('Admin')).toBe(false)
    })
  })

  describe('isHR', () => {
    it('HR Manager = true', () => {
      expect(isHR('HR Manager')).toBe(true)
    })

    it('Admin = false', () => {
      expect(isHR('Admin')).toBe(false)
    })
  })

  describe('isAdminOrHR', () => {
    it('Admin = true', () => {
      expect(isAdminOrHR('Admin')).toBe(true)
    })

    it('HR Manager = true', () => {
      expect(isAdminOrHR('HR Manager')).toBe(true)
    })

    it('Employee = false', () => {
      expect(isAdminOrHR('Employee')).toBe(false)
    })
  })
})
