/**
 * DepartmentHierarchyService — unit testlar.
 *
 * Bo'lim daraxt tuzilmasini to'g'ri resolve qilishini tekshiradi.
 */

// Direct import bypass — jest module mapping @prisma conflicts
// DepartmentHierarchyService'ni manual mock bilan test qilamiz
jest.mock('@prisma/client', () => ({}), { virtual: true })
jest.mock('@prisma', () => ({ PrismaService: class {} }), { virtual: true })

import { DepartmentHierarchyService } from '../../src/casl/department-hierarchy.service'

describe('DepartmentHierarchyService', () => {
  let service: DepartmentHierarchyService

  // Mock PrismaService
  const mockDepartments = [
    { id: 'rektorat', parentId: null, directorId: 'rektor-1' },
    { id: 'it-dept', parentId: 'rektorat', directorId: 'it-head-1' },
    { id: 'org-dept', parentId: 'it-dept', directorId: null },
    { id: 'dev-dept', parentId: 'it-dept', directorId: null },
    { id: 'finance', parentId: 'rektorat', directorId: 'finance-head-1' },
    { id: 'hr-dept', parentId: 'rektorat', directorId: 'hr-head-1' },
  ]

  const mockPrisma = {
    department: {
      findMany: jest.fn().mockResolvedValue(mockDepartments),
    },
  } as any

  beforeEach(() => {
    service = new DepartmentHierarchyService(mockPrisma)
    // Clear cache between tests
    ;(service as any).constructor // access cache clearing
  })

  describe('resolveScope', () => {
    it('IT boshliq — o\'z dept + subordinate deptlar', async () => {
      const scope = await service.resolveScope('it-head-1', 'it-dept')

      expect(scope.isDeptHead).toBe(true)
      expect(scope.ownDeptId).toBe('it-dept')
      expect(scope.subordinateDeptIds).toContain('it-dept')
      expect(scope.subordinateDeptIds).toContain('org-dept')
      expect(scope.subordinateDeptIds).toContain('dev-dept')
      expect(scope.subordinateDeptIds).not.toContain('finance')
      expect(scope.subordinateDeptIds).not.toContain('hr-dept')
    })

    it('Rektor — hamma dept', async () => {
      const scope = await service.resolveScope('rektor-1', 'rektorat')

      expect(scope.isDeptHead).toBe(true)
      expect(scope.subordinateDeptIds).toContain('rektorat')
      expect(scope.subordinateDeptIds).toContain('it-dept')
      expect(scope.subordinateDeptIds).toContain('org-dept')
      expect(scope.subordinateDeptIds).toContain('finance')
      expect(scope.subordinateDeptIds).toContain('hr-dept')
    })

    it('Oddiy xodim — subordinate yo\'q', async () => {
      const scope = await service.resolveScope('regular-user', 'it-dept')

      expect(scope.isDeptHead).toBe(false)
      expect(scope.subordinateDeptIds).toHaveLength(0)
      expect(scope.ownDeptId).toBe('it-dept')
    })

    it('Finance boshliq — faqat finance', async () => {
      const scope = await service.resolveScope('finance-head-1', 'finance')

      expect(scope.isDeptHead).toBe(true)
      expect(scope.subordinateDeptIds).toContain('finance')
      expect(scope.subordinateDeptIds).not.toContain('it-dept')
    })

    it('Ancestor chain — IT xodimi uchun', async () => {
      const scope = await service.resolveScope('regular-user', 'org-dept')

      expect(scope.ancestorDeptIds).toContain('org-dept') // o'zi
      expect(scope.ancestorDeptIds).toContain('it-dept') // ota
      expect(scope.ancestorDeptIds).toContain('rektorat') // ota-ota
    })

    it('Departmentsiz foydalanuvchi', async () => {
      const scope = await service.resolveScope('no-dept-user', null)

      expect(scope.isDeptHead).toBe(false)
      expect(scope.ownDeptId).toBeNull()
      expect(scope.subordinateDeptIds).toHaveLength(0)
      expect(scope.ancestorDeptIds).toHaveLength(0)
    })
  })
})
