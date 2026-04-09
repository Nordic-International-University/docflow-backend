/**
 * Ability Factory — user context'dan to'liq AppAbility yaratadi.
 *
 * Bu NestJS service sifatida inject qilinadi va controller/guard'larda ishlatiladi.
 * Har so'rov uchun user'ning roleName, departmentId, userId asosida
 * barcha ABAC qoidalar birlashtiriladi.
 *
 * Ishlatish:
 *   const ability = this.abilityFactory.createForUser({
 *     id: req.user.userId,
 *     roleName: req.user.roleName,
 *     departmentId: req.user.departmentId,
 *   })
 *
 *   // Tekshirish
 *   if (ability.can('update', subject('Document', document))) { ... }
 *
 *   // Prisma filter
 *   const where = accessibleBy(ability).Document
 */

import { Injectable } from '@nestjs/common'
import { AbilityBuilder } from '@casl/ability'
import { AppAbility, CaslUser, createAppAbility } from './casl.types'
import { ROLE_NAMES } from '@constants'

import { defineDocumentAbility } from './policies/document.policy'
import { defineProjectAbility } from './policies/project.policy'
import { defineTaskAbility } from './policies/task.policy'
import { defineChatAbility } from './policies/chat.policy'
import { defineWorkflowAbility } from './policies/workflow.policy'

@Injectable()
export class AbilityFactory {
  /**
   * Bitta resource uchun alohida ability
   */
  createDocumentAbility(user: CaslUser): AppAbility {
    return defineDocumentAbility(user)
  }

  createProjectAbility(user: CaslUser): AppAbility {
    return defineProjectAbility(user)
  }

  createTaskAbility(user: CaslUser): AppAbility {
    return defineTaskAbility(user)
  }

  createChatAbility(user: CaslUser): AppAbility {
    return defineChatAbility(user)
  }

  createWorkflowAbility(user: CaslUser): AppAbility {
    return defineWorkflowAbility(user)
  }

  /**
   * Universal ability — barcha resource'lar uchun bitta ability.
   * Frontend'ga serialization uchun yoki universal tekshirish uchun.
   */
  createForUser(user: CaslUser): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(createAppAbility as any)

    const isAdmin =
      user.roleName === ROLE_NAMES.SUPER_ADMIN ||
      user.roleName === ROLE_NAMES.ADMIN

    if (isAdmin) {
      can('manage', 'Document')
      can('manage', 'Workflow')
      can('manage', 'WorkflowStep')
      can('manage', 'Project')
      can('manage', 'Task')
      can('manage', 'Chat')
      can('manage', 'ChatMessage')
      can('manage', 'User')
      can('manage', 'Attachment')
      can('manage', 'Notification')
      // APPROVED hujjatlar immutable
      cannot('update', 'Document', { status: 'APPROVED' })
      cannot('update', 'Document', { status: 'ARCHIVED' })
      cannot('update', 'Workflow', { status: 'COMPLETED' })
      return build()
    }

    // Document
    can('create', 'Document')
    can('read', 'Document', { createdById: user.id })
    can('update', 'Document', { createdById: user.id, status: 'DRAFT' })
    can('update', 'Document', { createdById: user.id, status: 'REJECTED' })
    can('delete', 'Document', { createdById: user.id, status: 'DRAFT' })
    can('download', 'Document', { createdById: user.id })
    can('download', 'Document', { status: 'APPROVED' })
    cannot('update', 'Document', { status: 'APPROVED' })
    cannot('update', 'Document', { status: 'ARCHIVED' })

    // Project
    can('create', 'Project')
    can('read', 'Project', { visibility: 'PUBLIC' })
    can('read', 'Project', { createdById: user.id })
    can('update', 'Project', { createdById: user.id })
    if (user.departmentId) {
      can('read', 'Project', {
        visibility: 'DEPARTMENT',
        departmentId: user.departmentId,
      })
    }

    // Task
    can('create', 'Task')
    can('read', 'Task', { createdById: user.id })
    can('update', 'Task', { createdById: user.id })
    can('delete', 'Task', { createdById: user.id })
    can('complete', 'Task', { createdById: user.id })

    // Chat
    can('read', 'Chat')
    can('create', 'Chat')
    can('send', 'ChatMessage')
    can('update', 'ChatMessage', { senderId: user.id })
    can('delete', 'ChatMessage', { senderId: user.id })
    can('forward', 'ChatMessage')
    can('call', 'Chat')

    // Workflow
    can('create', 'Workflow')
    can('read', 'Workflow')
    can('approve', 'WorkflowStep')
    can('reject', 'WorkflowStep')
    can('sign', 'WorkflowStep')
    cannot('update', 'Workflow', { status: 'COMPLETED' })

    // Notification — o'ziniki
    can('read', 'Notification', { userId: user.id })
    can('update', 'Notification', { userId: user.id })
    can('delete', 'Notification', { userId: user.id })

    // User — o'zini o'qish
    can('read', 'User')
    can('update', 'User', { id: user.id })

    // Attachment — o'zi yuklagan
    can('read', 'Attachment')
    can('create', 'Attachment')
    can('delete', 'Attachment', { uploadedById: user.id })

    return build()
  }

  /**
   * Frontend uchun serializatsiya — rules qoidalar massivi.
   * Frontend'da `createMongoAbility(rules)` bilan qayta ishlatiladi.
   */
  serializeForUser(user: CaslUser): any[] {
    const ability = this.createForUser(user)
    return ability.rules
  }
}
