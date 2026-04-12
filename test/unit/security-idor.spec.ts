/**
 * IDOR Security Tests — ownership check'lar to'g'ri ishlashini tekshirish.
 *
 * Bu testlar IDOR (Insecure Direct Object Reference) zaifliklarning
 * TUZATILGANLIGINI kafolatlaydi.
 */

import { AbilityFactory } from '../../src/casl/ability.factory'
import { CaslUser } from '../../src/casl/casl.types'
import { subject } from '@casl/ability'

describe('IDOR Security — Ownership Checks', () => {
  let factory: AbilityFactory

  beforeAll(() => {
    factory = new AbilityFactory()
  })

  const userA: CaslUser = {
    id: 'user-A',
    roleName: 'Employee',
    departmentId: 'dept-1',
    subordinateDeptIds: [],
    isDeptHead: false,
  }

  const userB: CaslUser = {
    id: 'user-B',
    roleName: 'Employee',
    departmentId: 'dept-2',
    subordinateDeptIds: [],
    isDeptHead: false,
  }

  const admin: CaslUser = {
    id: 'admin-1',
    roleName: 'System Administrator',
    departmentId: 'dept-1',
  }

  describe('Document IDOR protection', () => {
    it('User A boshqa user document\'ini update qila OLMAYDI', () => {
      const ability = factory.createForUser(userA)
      const doc = { createdById: 'user-B', status: 'DRAFT' }
      expect(ability.can('update', subject('Document', doc as any))).toBe(false)
    })

    it('User A o\'z DRAFT document\'ini update qila OLADI', () => {
      const ability = factory.createForUser(userA)
      const doc = { createdById: 'user-A', status: 'DRAFT' }
      expect(ability.can('update', subject('Document', doc as any))).toBe(true)
    })

    it('User A boshqa user document\'ini delete qila OLMAYDI', () => {
      const ability = factory.createForUser(userA)
      const doc = { createdById: 'user-B', status: 'DRAFT' }
      expect(ability.can('delete', subject('Document', doc as any))).toBe(false)
    })

    it('Admin document yarata va o\'qiy oladi', () => {
      const ability = factory.createForUser(admin)
      expect(ability.can('create', 'Document')).toBe(true)
      expect(ability.can('read', 'Document')).toBe(true)
      // Note: admin manage + cannot(update, APPROVED) — Prisma adapter
      // subject() bilan ishlashda cheklov bor. Real admin himoyasi
      // service'da isAdmin() check orqali amalga oshiriladi.
    })

    it('Hech kim APPROVED document\'ni update qila OLMAYDI', () => {
      const ability = factory.createForUser(admin)
      const doc = { createdById: 'admin-1', status: 'APPROVED' }
      expect(ability.can('update', subject('Document', doc as any))).toBe(false)
    })
  })

  describe('Task IDOR protection', () => {
    it('User A boshqa user task\'ini ko\'ra OLMAYDI (ownership)', () => {
      const ability = factory.createForUser(userA)
      const task = { createdById: 'user-B' }
      expect(ability.can('read', subject('Task', task as any))).toBe(false)
    })

    it('User A o\'z task\'ini ko\'ra OLADI', () => {
      const ability = factory.createForUser(userA)
      const task = { createdById: 'user-A' }
      expect(ability.can('read', subject('Task', task as any))).toBe(true)
    })

    it('User A o\'z task\'ini update qila OLADI', () => {
      const ability = factory.createForUser(userA)
      const task = { createdById: 'user-A' }
      expect(ability.can('update', subject('Task', task as any))).toBe(true)
    })

    it('User A boshqa user task\'ini update qila OLMAYDI', () => {
      const ability = factory.createForUser(userA)
      const task = { createdById: 'user-B' }
      expect(ability.can('update', subject('Task', task as any))).toBe(false)
    })
  })

  describe('Notification IDOR protection', () => {
    it('User A boshqa user notification\'ini ko\'ra OLMAYDI', () => {
      const ability = factory.createForUser(userA)
      const notif = { userId: 'user-B' }
      expect(
        ability.can('read', subject('Notification', notif as any)),
      ).toBe(false)
    })

    it('User A o\'z notification\'ini ko\'ra OLADI', () => {
      const ability = factory.createForUser(userA)
      const notif = { userId: 'user-A' }
      expect(
        ability.can('read', subject('Notification', notif as any)),
      ).toBe(true)
    })

    it('User A boshqa user notification\'ini delete qila OLMAYDI', () => {
      const ability = factory.createForUser(userA)
      const notif = { userId: 'user-B' }
      expect(
        ability.can('delete', subject('Notification', notif as any)),
      ).toBe(false)
    })
  })

  describe('WorkflowStep IDOR protection', () => {
    it('User A boshqa user step\'ini approve qila OLMAYDI', () => {
      const ability = factory.createForUser(userA)
      const step = { assignedToUserId: 'user-B', status: 'IN_PROGRESS' }
      expect(
        ability.can('approve', subject('WorkflowStep', step as any)),
      ).toBe(false)
    })

    it('User A o\'z step\'ini approve qila OLADI', () => {
      const ability = factory.createForUser(userA)
      const step = { assignedToUserId: 'user-A', status: 'IN_PROGRESS' }
      expect(
        ability.can('approve', subject('WorkflowStep', step as any)),
      ).toBe(true)
    })

    it('NOT_STARTED step\'ni approve qila OLMAYDI', () => {
      const ability = factory.createForUser(userA)
      const step = { assignedToUserId: 'user-A', status: 'NOT_STARTED' }
      expect(
        ability.can('approve', subject('WorkflowStep', step as any)),
      ).toBe(false)
    })
  })

  describe('Cross-department isolation', () => {
    it('User A boshqa dept journal\'ini ko\'ra OLMAYDI', () => {
      const ability = factory.createForUser(userA) // dept-1
      const journal = { departmentId: 'dept-2' }
      expect(
        ability.can('read', subject('Journal', journal as any)),
      ).toBe(false)
    })

    it('User A o\'z dept journal\'ini ko\'ra OLADI', () => {
      const ability = factory.createForUser(userA) // dept-1
      const journal = { departmentId: 'dept-1' }
      expect(
        ability.can('read', subject('Journal', journal as any)),
      ).toBe(true)
    })

    it('User A o\'z profile\'ini update qila OLADI', () => {
      const ability = factory.createForUser(userA)
      expect(
        ability.can('update', subject('User', { id: 'user-A' } as any)),
      ).toBe(true)
    })

    it('User A boshqa user profile\'ini update qila OLMAYDI', () => {
      const ability = factory.createForUser(userA)
      expect(
        ability.can('update', subject('User', { id: 'user-B' } as any)),
      ).toBe(false)
    })
  })
})
