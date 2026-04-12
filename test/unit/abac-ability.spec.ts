/**
 * ABAC Ability Factory — unit testlar.
 *
 * AbilityFactory.createForUser() har role uchun to'g'ri qoidalar
 * yaratganini tekshiradi. Department hierarchy, ownership, status
 * cheklovlari qamrab olingan.
 */

import { AbilityFactory } from '../../src/casl/ability.factory'
import { CaslUser } from '../../src/casl/casl.types'
import { subject } from '@casl/ability'

describe('AbilityFactory', () => {
  let factory: AbilityFactory

  beforeAll(() => {
    factory = new AbilityFactory()
  })

  // ═══════════════════════════════════════════════════
  // ADMIN
  // ═══════════════════════════════════════════════════

  describe('Admin user', () => {
    const admin: CaslUser = {
      id: 'admin-1',
      roleName: 'System Administrator',
      departmentId: 'dept-1',
    }

    it('hamma document'ni ko\'ra oladi', () => {
      const ability = factory.createForUser(admin)
      expect(ability.can('read', 'Document')).toBe(true)
      expect(ability.can('manage', 'Document')).toBe(true)
    })

    it('hamma task'ni boshqara oladi', () => {
      const ability = factory.createForUser(admin)
      expect(ability.can('manage', 'Task')).toBe(true)
    })

    it('hamma workflow'ni boshqara oladi', () => {
      const ability = factory.createForUser(admin)
      expect(ability.can('manage', 'Workflow')).toBe(true)
    })

    it('hamma journal'ni boshqara oladi', () => {
      const ability = factory.createForUser(admin)
      expect(ability.can('manage', 'Journal')).toBe(true)
    })

    it('APPROVED document'ni update qila OLMAYDI', () => {
      const ability = factory.createForUser(admin)
      expect(
        ability.can(
          'update',
          subject('Document', { status: 'APPROVED' } as any),
        ),
      ).toBe(false)
    })

    it('ARCHIVED document'ni update qila OLMAYDI', () => {
      const ability = factory.createForUser(admin)
      expect(
        ability.can(
          'update',
          subject('Document', { status: 'ARCHIVED' } as any),
        ),
      ).toBe(false)
    })

    it('COMPLETED workflow'ni update qila OLMAYDI', () => {
      const ability = factory.createForUser(admin)
      expect(
        ability.can(
          'update',
          subject('Workflow', { status: 'COMPLETED' } as any),
        ),
      ).toBe(false)
    })
  })

  // ═══════════════════════════════════════════════════
  // REGULAR USER
  // ═══════════════════════════════════════════════════

  describe('Regular user', () => {
    const user: CaslUser = {
      id: 'user-1',
      roleName: 'Employee',
      departmentId: 'dept-it',
      subordinateDeptIds: [],
      isDeptHead: false,
    }

    it('o\'z document'ini ko\'ra oladi', () => {
      const ability = factory.createForUser(user)
      expect(
        ability.can(
          'read',
          subject('Document', { createdById: 'user-1' } as any),
        ),
      ).toBe(true)
    })

    it('boshqa user document'ini ko\'ra OLMAYDI', () => {
      const ability = factory.createForUser(user)
      expect(
        ability.can(
          'read',
          subject('Document', { createdById: 'user-2' } as any),
        ),
      ).toBe(false)
    })

    it('DRAFT document'ini update qila oladi', () => {
      const ability = factory.createForUser(user)
      expect(
        ability.can(
          'update',
          subject('Document', {
            createdById: 'user-1',
            status: 'DRAFT',
          } as any),
        ),
      ).toBe(true)
    })

    it('APPROVED document'ini update qila OLMAYDI', () => {
      const ability = factory.createForUser(user)
      expect(
        ability.can(
          'update',
          subject('Document', {
            createdById: 'user-1',
            status: 'APPROVED',
          } as any),
        ),
      ).toBe(false)
    })

    it('DRAFT document'ini delete qila oladi', () => {
      const ability = factory.createForUser(user)
      expect(
        ability.can(
          'delete',
          subject('Document', {
            createdById: 'user-1',
            status: 'DRAFT',
          } as any),
        ),
      ).toBe(true)
    })

    it('boshqa user document'ini delete qila OLMAYDI', () => {
      const ability = factory.createForUser(user)
      expect(
        ability.can(
          'delete',
          subject('Document', {
            createdById: 'user-2',
            status: 'DRAFT',
          } as any),
        ),
      ).toBe(false)
    })

    it('document yarata oladi', () => {
      const ability = factory.createForUser(user)
      expect(ability.can('create', 'Document')).toBe(true)
    })

    it('task yarata oladi', () => {
      const ability = factory.createForUser(user)
      expect(ability.can('create', 'Task')).toBe(true)
    })

    it('o\'z task'ini ko\'ra oladi', () => {
      const ability = factory.createForUser(user)
      expect(
        ability.can(
          'read',
          subject('Task', { createdById: 'user-1' } as any),
        ),
      ).toBe(true)
    })

    it('o\'z notification'ini ko\'ra oladi', () => {
      const ability = factory.createForUser(user)
      expect(
        ability.can(
          'read',
          subject('Notification', { userId: 'user-1' } as any),
        ),
      ).toBe(true)
    })

    it('boshqa user notification'ini ko\'ra OLMAYDI', () => {
      const ability = factory.createForUser(user)
      expect(
        ability.can(
          'read',
          subject('Notification', { userId: 'user-2' } as any),
        ),
      ).toBe(false)
    })

    it('o\'z profile'ini update qila oladi', () => {
      const ability = factory.createForUser(user)
      expect(
        ability.can('update', subject('User', { id: 'user-1' } as any)),
      ).toBe(true)
    })

    it('boshqa user profile'ini update qila OLMAYDI', () => {
      const ability = factory.createForUser(user)
      expect(
        ability.can('update', subject('User', { id: 'user-2' } as any)),
      ).toBe(false)
    })

    it('o\'z workflow step'ini approve qila oladi', () => {
      const ability = factory.createForUser(user)
      expect(
        ability.can(
          'approve',
          subject('WorkflowStep', {
            assignedToUserId: 'user-1',
            status: 'IN_PROGRESS',
          } as any),
        ),
      ).toBe(true)
    })

    it('boshqa user step'ini approve qila OLMAYDI', () => {
      const ability = factory.createForUser(user)
      expect(
        ability.can(
          'approve',
          subject('WorkflowStep', {
            assignedToUserId: 'user-2',
            status: 'IN_PROGRESS',
          } as any),
        ),
      ).toBe(false)
    })

    it('o\'z dept journal'ini ko\'ra oladi', () => {
      const ability = factory.createForUser(user)
      expect(
        ability.can(
          'read',
          subject('Journal', { departmentId: 'dept-it' } as any),
        ),
      ).toBe(true)
    })

    it('boshqa dept journal'ini ko\'ra OLMAYDI', () => {
      const ability = factory.createForUser(user)
      expect(
        ability.can(
          'read',
          subject('Journal', { departmentId: 'dept-finance' } as any),
        ),
      ).toBe(false)
    })

    it('PUBLIC project'ni ko\'ra oladi', () => {
      const ability = factory.createForUser(user)
      expect(
        ability.can(
          'read',
          subject('Project', { visibility: 'PUBLIC' } as any),
        ),
      ).toBe(true)
    })
  })

  // ═══════════════════════════════════════════════════
  // DEPARTMENT HEAD
  // ═══════════════════════════════════════════════════

  describe('Department head', () => {
    const deptHead: CaslUser = {
      id: 'head-1',
      roleName: 'Employee',
      departmentId: 'dept-it',
      subordinateDeptIds: ['dept-it', 'dept-org', 'dept-dev'],
      isDeptHead: true,
    }

    it('subordinate dept journal'ini ko\'ra oladi', () => {
      const ability = factory.createForUser(deptHead)
      expect(
        ability.can(
          'read',
          subject('Journal', { departmentId: 'dept-org' } as any),
        ),
      ).toBe(true)
    })

    it('subordinate dept journal'ini manage qila oladi', () => {
      const ability = factory.createForUser(deptHead)
      expect(
        ability.can(
          'manage',
          subject('Journal', { departmentId: 'dept-dev' } as any),
        ),
      ).toBe(true)
    })

    it('tashqi dept journal'ini ko\'ra OLMAYDI', () => {
      const ability = factory.createForUser(deptHead)
      expect(
        ability.can(
          'read',
          subject('Journal', { departmentId: 'dept-finance' } as any),
        ),
      ).toBe(false)
    })

    it('subordinate dept DEPARTMENT project'ni ko\'ra oladi', () => {
      const ability = factory.createForUser(deptHead)
      expect(
        ability.can(
          'read',
          subject('Project', {
            visibility: 'DEPARTMENT',
            departmentId: 'dept-org',
          } as any),
        ),
      ).toBe(true)
    })
  })

  // ═══════════════════════════════════════════════════
  // HR MANAGER
  // ═══════════════════════════════════════════════════

  describe('HR Manager', () => {
    const hr: CaslUser = {
      id: 'hr-1',
      roleName: 'HR Manager',
      departmentId: 'dept-hr',
    }

    it('hamma documentni kora oladi', () => {
      const ability = factory.createForUser(hr)
      expect(ability.can('read', 'Document')).toBe(true)
    })

    it('hamma userni kora oladi', () => {
      const ability = factory.createForUser(hr)
      expect(ability.can('read', 'User')).toBe(true)
    })

    it('userlarni boshqara oladi', () => {
      const ability = factory.createForUser(hr)
      expect(ability.can('manage', 'User')).toBe(true)
    })
  })
})
