import { subject } from '@casl/ability'
import { defineDocumentAbility } from '../../src/casl/policies/document.policy'
import { defineProjectAbility } from '../../src/casl/policies/project.policy'
import { defineTaskAbility } from '../../src/casl/policies/task.policy'
import { defineChatAbility } from '../../src/casl/policies/chat.policy'
import { defineWorkflowAbility } from '../../src/casl/policies/workflow.policy'
import { AbilityFactory } from '../../src/casl/ability.factory'
import type { CaslUser } from '../../src/casl/casl.types'

const superAdmin: CaslUser = { id: 'admin-1', roleName: 'Super Administrator' }
const menejer: CaslUser = { id: 'user-1', roleName: 'Menejer', departmentId: 'dept-1' }
const xodim: CaslUser = { id: 'user-2', roleName: 'Xodim', departmentId: 'dept-1' }
const boshqaDept: CaslUser = { id: 'user-3', roleName: 'Xodim', departmentId: 'dept-2' }

describe('CASL Document Policy', () => {
  it('SuperAdmin hamma narsani qila oladi', () => {
    const ability = defineDocumentAbility(superAdmin)
    expect(ability.can('read', 'Document')).toBe(true)
    expect(ability.can('create', 'Document')).toBe(true)
    expect(ability.can('delete', 'Document')).toBe(true)
  })

  it('SuperAdmin APPROVED hujjatni tahrirlay olmaydi', () => {
    const ability = defineDocumentAbility(superAdmin)
    const approved = subject('Document', { status: 'APPROVED', createdById: 'x' } as any)
    expect(ability.can('update', approved)).toBe(false)
  })

  it('Oddiy user o\'z DRAFT hujjatini tahrirlay oladi', () => {
    const ability = defineDocumentAbility(xodim)
    const myDraft = subject('Document', {
      createdById: xodim.id,
      status: 'DRAFT',
    } as any)
    expect(ability.can('update', myDraft)).toBe(true)
  })

  it('Oddiy user boshqaning DRAFT hujjatini tahrirlay olmaydi', () => {
    const ability = defineDocumentAbility(xodim)
    const otherDraft = subject('Document', {
      createdById: 'other-user',
      status: 'DRAFT',
    } as any)
    expect(ability.can('update', otherDraft)).toBe(false)
  })

  it('Oddiy user APPROVED hujjatni o\'chira olmaydi', () => {
    const ability = defineDocumentAbility(xodim)
    const approved = subject('Document', {
      createdById: xodim.id,
      status: 'APPROVED',
    } as any)
    expect(ability.can('delete', approved)).toBe(false)
  })

  it('Oddiy user APPROVED hujjatni yuklay oladi', () => {
    const ability = defineDocumentAbility(xodim)
    const approved = subject('Document', { status: 'APPROVED' } as any)
    expect(ability.can('download', approved)).toBe(true)
  })
})

describe('CASL Project Policy', () => {
  it('SuperAdmin hamma loyihani ko\'radi', () => {
    const ability = defineProjectAbility(superAdmin)
    expect(ability.can('read', 'Project')).toBe(true)
    expect(ability.can('delete', 'Project')).toBe(true)
  })

  it('Public loyiha hamma uchun ko\'rinadi', () => {
    const ability = defineProjectAbility(xodim)
    const pub = subject('Project', { visibility: 'PUBLIC' } as any)
    expect(ability.can('read', pub)).toBe(true)
  })

  it('DEPARTMENT loyiha — o\'z bo\'limi ko\'radi', () => {
    const ability = defineProjectAbility(xodim)
    const deptProj = subject('Project', {
      visibility: 'DEPARTMENT',
      departmentId: xodim.departmentId,
    } as any)
    expect(ability.can('read', deptProj)).toBe(true)
  })

  it('DEPARTMENT loyiha — boshqa bo\'lim ko\'rmaydi', () => {
    const ability = defineProjectAbility(xodim)
    const otherDeptProj = subject('Project', {
      visibility: 'DEPARTMENT',
      departmentId: 'dept-999',
    } as any)
    expect(ability.can('read', otherDeptProj)).toBe(false)
  })
})

describe('CASL Task Policy', () => {
  it('O\'zi yaratgan taskni o\'chira oladi', () => {
    const ability = defineTaskAbility(xodim)
    const myTask = subject('Task', { createdById: xodim.id } as any)
    expect(ability.can('delete', myTask)).toBe(true)
  })

  it('Boshqa odam taskini o\'chira olmaydi', () => {
    const ability = defineTaskAbility(xodim)
    const otherTask = subject('Task', { createdById: 'other' } as any)
    expect(ability.can('delete', otherTask)).toBe(false)
  })
})

describe('CASL Chat Policy', () => {
  it('O\'z xabarini tahrirlash', () => {
    const ability = defineChatAbility(xodim)
    const myMsg = subject('ChatMessage', { senderId: xodim.id } as any)
    expect(ability.can('update', myMsg)).toBe(true)
  })

  it('Boshqaning xabarini tahrirlay olmaydi', () => {
    const ability = defineChatAbility(xodim)
    const otherMsg = subject('ChatMessage', { senderId: 'other' } as any)
    expect(ability.can('update', otherMsg)).toBe(false)
  })

  it('Admin boshqaning xabarini o\'chira oladi', () => {
    const ability = defineChatAbility(superAdmin)
    const otherMsg = subject('ChatMessage', { senderId: 'other' } as any)
    expect(ability.can('delete', otherMsg)).toBe(true)
  })
})

describe('CASL Workflow Policy', () => {
  it('COMPLETED workflow o\'zgartirilmaydi', () => {
    const ability = defineWorkflowAbility(superAdmin)
    const completed = subject('Workflow', { status: 'COMPLETED' } as any)
    expect(ability.can('update', completed)).toBe(false)
  })
})

describe('AbilityFactory', () => {
  const factory = new AbilityFactory()

  it('createForUser — admin', () => {
    const ab = factory.createForUser(superAdmin)
    expect(ab.can('manage', 'Document')).toBe(true)
    expect(ab.can('manage', 'Task')).toBe(true)
  })

  it('createForUser — oddiy user', () => {
    const ab = factory.createForUser(xodim)
    const myDoc = subject('Document', { createdById: xodim.id, status: 'DRAFT' } as any)
    expect(ab.can('update', myDoc)).toBe(true)
    const otherDoc = subject('Document', { createdById: 'other', status: 'DRAFT' } as any)
    expect(ab.can('update', otherDoc)).toBe(false)
  })

  it('serializeForUser — rules qaytaradi', () => {
    const rules = factory.serializeForUser(xodim)
    expect(Array.isArray(rules)).toBe(true)
    expect(rules.length).toBeGreaterThan(10)
  })
})
