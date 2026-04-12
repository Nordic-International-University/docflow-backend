/**
 * Performance Tests — critical path performance benchmarks.
 * Tez ishlashini kafolatlash uchun vaqt chegaralari.
 */

import { parsePagination } from '../../src/common/helpers/pagination.helper'
import {
  isAdmin,
  isSuperAdmin,
  isHR,
} from '../../src/common/helpers/role.helper'
import {
  createBlankDocx,
  createBlankXlsx,
  createBlankPptx,
} from '../../src/common/utils/blank-document.util'
import {
  setCachedPdf,
  popCachedPdf,
} from '../../src/common/utils/pdf-conversion-cache'
import { AbilityFactory } from '../../src/casl/ability.factory'

describe('Performance Benchmarks', () => {
  describe('Pagination parsing — < 1ms', () => {
    it('1000 marta parse qilish < 10ms', () => {
      const start = Date.now()
      for (let i = 0; i < 1000; i++) {
        parsePagination({ pageNumber: i, pageSize: 20 })
      }
      const elapsed = Date.now() - start
      expect(elapsed).toBeLessThan(10)
    })
  })

  describe('Role check — < 0.1ms per call', () => {
    it('10000 marta role check < 5ms', () => {
      const roles = ['System Administrator', 'Admin', 'Employee', 'HR Manager', undefined]
      const start = Date.now()
      for (let i = 0; i < 10000; i++) {
        isAdmin(roles[i % 5])
        isSuperAdmin(roles[i % 5])
        isHR(roles[i % 5])
      }
      const elapsed = Date.now() - start
      expect(elapsed).toBeLessThan(5)
    })
  })

  describe('CASL Ability creation — < 5ms per user', () => {
    const factory = new AbilityFactory()

    it('admin ability < 5ms', () => {
      const start = Date.now()
      factory.createForUser({
        id: 'u1',
        roleName: 'System Administrator',
        departmentId: 'd1',
      })
      const elapsed = Date.now() - start
      expect(elapsed).toBeLessThan(5)
    })

    it('regular user ability < 5ms', () => {
      const start = Date.now()
      factory.createForUser({
        id: 'u1',
        roleName: 'Employee',
        departmentId: 'd1',
        subordinateDeptIds: [],
        isDeptHead: false,
      })
      const elapsed = Date.now() - start
      expect(elapsed).toBeLessThan(5)
    })

    it('dept head ability (10 subordinate depts) < 5ms', () => {
      const start = Date.now()
      factory.createForUser({
        id: 'u1',
        roleName: 'Employee',
        departmentId: 'd1',
        subordinateDeptIds: Array.from({ length: 10 }, (_, i) => `dept-${i}`),
        isDeptHead: true,
      })
      const elapsed = Date.now() - start
      expect(elapsed).toBeLessThan(5)
    })

    it('100 ta ability yaratish < 100ms', () => {
      const start = Date.now()
      for (let i = 0; i < 100; i++) {
        factory.createForUser({
          id: `user-${i}`,
          roleName: i % 5 === 0 ? 'System Administrator' : 'Employee',
          departmentId: `dept-${i % 10}`,
          subordinateDeptIds: i % 3 === 0 ? [`dept-${i}`] : [],
          isDeptHead: i % 3 === 0,
        })
      }
      const elapsed = Date.now() - start
      expect(elapsed).toBeLessThan(100)
    })
  })

  describe('Blank document generation — < 10ms', () => {
    it('DOCX < 10ms', () => {
      const start = Date.now()
      createBlankDocx()
      expect(Date.now() - start).toBeLessThan(10)
    })

    it('XLSX < 10ms', () => {
      const start = Date.now()
      createBlankXlsx()
      expect(Date.now() - start).toBeLessThan(10)
    })

    it('PPTX < 10ms', () => {
      const start = Date.now()
      createBlankPptx()
      expect(Date.now() - start).toBeLessThan(10)
    })

    it('100 ta DOCX yaratish < 200ms', () => {
      const start = Date.now()
      for (let i = 0; i < 100; i++) createBlankDocx()
      expect(Date.now() - start).toBeLessThan(200)
    })
  })

  describe('PDF Cache — < 0.1ms per operation', () => {
    it('1000 set + 1000 pop < 10ms', () => {
      const start = Date.now()
      for (let i = 0; i < 1000; i++) {
        setCachedPdf(`perf-${i}`, {
          pdfUrl: `url-${i}`,
          pdfFileName: `file-${i}.pdf`,
          pdfFileSize: 1024 * i,
        })
      }
      for (let i = 0; i < 1000; i++) {
        popCachedPdf(`perf-${i}`)
      }
      expect(Date.now() - start).toBeLessThan(10)
    })
  })

  describe('Memory — object sizes', () => {
    it('CASL ability object size reasonable', () => {
      const factory = new AbilityFactory()
      const ability = factory.createForUser({
        id: 'u1',
        roleName: 'Employee',
        departmentId: 'd1',
        subordinateDeptIds: ['d1', 'd2', 'd3'],
        isDeptHead: true,
      })

      const rules = ability.rules
      expect(rules.length).toBeGreaterThan(5) // bir nechta rule bo'lishi kerak
      expect(rules.length).toBeLessThan(100) // juda ko'p emas
    })

    it('blank DOCX size < 5KB', () => {
      const docx = createBlankDocx()
      expect(docx.length).toBeLessThan(5 * 1024)
    })
  })
})

describe('Stress — concurrent operations', () => {
  it('1000 ta parallel pagination parse', async () => {
    const promises = Array.from({ length: 1000 }, (_, i) =>
      Promise.resolve(parsePagination({ pageNumber: i, pageSize: 20 })),
    )
    const results = await Promise.all(promises)
    expect(results).toHaveLength(1000)
    expect(results[999].page).toBe(999)
  })

  it('1000 ta parallel cache set/pop', async () => {
    const setPromises = Array.from({ length: 1000 }, (_, i) =>
      Promise.resolve(
        setCachedPdf(`stress-${i}`, {
          pdfUrl: `u-${i}`,
          pdfFileName: `f-${i}`,
          pdfFileSize: i,
        }),
      ),
    )
    await Promise.all(setPromises)

    const popPromises = Array.from({ length: 1000 }, (_, i) =>
      Promise.resolve(popCachedPdf(`stress-${i}`)),
    )
    const results = await Promise.all(popPromises)
    const found = results.filter((r) => r !== null)
    expect(found.length).toBe(1000)
  })

  it('100 ta parallel ability creation', async () => {
    const factory = new AbilityFactory()
    const promises = Array.from({ length: 100 }, (_, i) =>
      Promise.resolve(
        factory.createForUser({
          id: `stress-user-${i}`,
          roleName: i % 2 === 0 ? 'System Administrator' : 'Employee',
          departmentId: `dept-${i}`,
        }),
      ),
    )
    const abilities = await Promise.all(promises)
    expect(abilities).toHaveLength(100)
    // Admin har ikkisida ham read qila oladi
    expect(abilities[0].can('read', 'Document')).toBe(true)
  })
})
