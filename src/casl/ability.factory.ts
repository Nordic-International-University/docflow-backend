/**
 * Ability Factory — user context + department hierarchy asosida AppAbility yaratadi.
 *
 * Ishlatish:
 *   const ability = this.abilityFactory.createForUser(caslUser)
 *
 *   // Tekshirish
 *   if (ability.can('update', subject('Document', document))) { ... }
 *
 *   // Prisma filter (service ichida)
 *   const where = accessibleBy(ability, 'read').Document
 *
 * Permissions (PermissionGuard) = "bu endpoint'ga kira oladimi?" (string match)
 * ABAC (PoliciesGuard + Ability) = "qaysi ma'lumotlarni ko'radi/o'zgartiradi?"
 *
 * Department hierarchy:
 *   IT Department (boshliq: Abdulaziz)
 *     └── Tashkiliy ishlar (xodim: Sherzod)
 *
 *   Abdulaziz → subordinateDeptIds = [IT, Tashkiliy ishlar]
 *     → IT + Tashkiliy ishlar'ning hujjatlarini ko'radi
 *   Sherzod → subordinateDeptIds = [] (boshliq emas)
 *     → faqat o'zi yaratgan yoki workflow participant bo'lgan hujjatlar
 */

import { Injectable } from '@nestjs/common'
import { AbilityBuilder } from '@casl/ability'
import { AppAbility, CaslUser, createAppAbility } from './casl.types'
import { ROLE_NAMES } from '@constants'

@Injectable()
export class AbilityFactory {
  createForUser(user: CaslUser): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createAppAbility as any,
    )

    const isAdmin =
      user.roleName === ROLE_NAMES.SUPER_ADMIN ||
      user.roleName === ROLE_NAMES.ADMIN
    const isHR = user.roleName === ROLE_NAMES.HR_MANAGER
    const isDeptHead = user.isDeptHead === true
    const subordinateDeptIds = user.subordinateDeptIds ?? []

    // ════════════════════════════════════════════
    //  SUPER ADMIN / ADMIN — hamma narsa
    // ════════════════════════════════════════════
    if (isAdmin) {
      can('manage', 'Document')
      can('manage', 'Workflow')
      can('manage', 'WorkflowStep')
      can('manage', 'Project')
      can('manage', 'Task')
      can('manage', 'Chat')
      can('manage', 'ChatMessage')
      can('manage', 'ChatMember')
      can('manage', 'User')
      can('manage', 'Attachment')
      can('manage', 'Notification')

      // APPROVED/ARCHIVED hujjatlar immutable
      cannot('update', 'Document', { status: 'APPROVED' })
      cannot('update', 'Document', { status: 'ARCHIVED' })
      cannot('update', 'Workflow', { status: 'COMPLETED' })
      cannot('update', 'Workflow', { status: 'CANCELLED' })

      return build()
    }

    // ════════════════════════════════════════════
    //  HR — barcha foydalanuvchilar + hujjatlar ko'rish
    // ════════════════════════════════════════════
    if (isHR) {
      can('read', 'Document')
      can('read', 'User')
      can('manage', 'User') // HR xodimlarni boshqaradi
    }

    // ════════════════════════════════════════════
    //  DOCUMENT
    // ════════════════════════════════════════════

    // Create — hamma
    can('create', 'Document')

    // Read — o'ziniki
    can('read', 'Document', { createdById: user.id })

    // Read — department hierarchy (boshliq o'z bo'limi + subordinate bo'limlar)
    if (isDeptHead && subordinateDeptIds.length > 0) {
      // document → journal → departmentId orqali bog'lanish
      // Prisma condition: journal.departmentId in subordinateDeptIds
      can('read', 'Document', {
        journal: { departmentId: { in: subordinateDeptIds } },
      } as any)
    }

    // Read — o'z bo'limining hujjatlari (oddiy xodim)
    if (user.departmentId && !isDeptHead) {
      can('read', 'Document', {
        journal: { departmentId: user.departmentId },
      } as any)
    }

    // Read — workflow ishtirokchisi (step assignee bo'lgan hujjatlar)
    can('read', 'Document', {
      workflow: {
        some: {
          deletedAt: null,
          workflowSteps: {
            some: {
              assignedToUserId: user.id,
              deletedAt: null,
            },
          },
        },
      },
    } as any)

    // Update — faqat DRAFT/REJECTED va yaratuvchi
    can('update', 'Document', { createdById: user.id, status: 'DRAFT' })
    can('update', 'Document', { createdById: user.id, status: 'REJECTED' })
    cannot('update', 'Document', { status: 'APPROVED' })
    cannot('update', 'Document', { status: 'ARCHIVED' })
    cannot('update', 'Document', { status: 'IN_REVIEW' })

    // Delete — faqat DRAFT va yaratuvchi
    can('delete', 'Document', { createdById: user.id, status: 'DRAFT' })

    // Download — yaratuvchi + approved
    can('download', 'Document', { createdById: user.id })
    can('download', 'Document', { status: 'APPROVED' })

    // ════════════════════════════════════════════
    //  WORKFLOW
    // ════════════════════════════════════════════

    can('create', 'Workflow')

    // Read — yaratuvchi hujjat'ining workflow'i
    can('read', 'Workflow')

    // Read — dept head o'z bo'limi workflow'lari
    // (service'da accessibleBy + additional filter bilan)

    // Update — faqat ACTIVE/PAUSED
    cannot('update', 'Workflow', { status: 'COMPLETED' })
    cannot('update', 'Workflow', { status: 'CANCELLED' })

    // ════════════════════════════════════════════
    //  WORKFLOW STEP
    // ════════════════════════════════════════════

    // Read — assignee
    can('read', 'WorkflowStep', { assignedToUserId: user.id })

    // Read — dept head
    if (isDeptHead && subordinateDeptIds.length > 0) {
      can('read', 'WorkflowStep')
    }

    // Approve/Reject/Sign — faqat o'z bosqichi, IN_PROGRESS
    can('approve', 'WorkflowStep', {
      assignedToUserId: user.id,
      status: 'IN_PROGRESS',
    })
    can('reject', 'WorkflowStep', {
      assignedToUserId: user.id,
      status: 'IN_PROGRESS',
    })
    can('sign', 'WorkflowStep', {
      assignedToUserId: user.id,
      status: 'IN_PROGRESS',
    })

    // ════════════════════════════════════════════
    //  PROJECT
    // ════════════════════════════════════════════

    can('create', 'Project')
    can('read', 'Project', { visibility: 'PUBLIC' } as any)
    can('read', 'Project', { createdById: user.id })
    // Project members — service'da qo'shimcha check (CASL nested relation)

    if (user.departmentId) {
      can('read', 'Project', {
        visibility: 'DEPARTMENT',
        departmentId: user.departmentId,
      } as any)
    }

    // Dept head — subordinate dept projects
    if (isDeptHead && subordinateDeptIds.length > 0) {
      can('read', 'Project', {
        visibility: 'DEPARTMENT',
        departmentId: { in: subordinateDeptIds },
      } as any)
    }

    can('update', 'Project', { createdById: user.id })
    can('delete', 'Project', { createdById: user.id })

    // ════════════════════════════════════════════
    //  TASK
    // ════════════════════════════════════════════

    can('create', 'Task')
    can('read', 'Task', { createdById: user.id })
    // Task assignees + watchers — service'da qo'shimcha check
    can('update', 'Task', { createdById: user.id })
    can('delete', 'Task', { createdById: user.id })
    can('complete', 'Task', { createdById: user.id })

    // ════════════════════════════════════════════
    //  CHAT
    // ════════════════════════════════════════════

    can('read', 'Chat')
    can('create', 'Chat')
    can('send', 'ChatMessage')
    can('update', 'ChatMessage', { senderId: user.id })
    can('delete', 'ChatMessage', { senderId: user.id })
    can('forward', 'ChatMessage')
    can('call', 'Chat')

    // ════════════════════════════════════════════
    //  NOTIFICATION — faqat o'ziniki
    // ════════════════════════════════════════════

    can('read', 'Notification', { userId: user.id })
    can('update', 'Notification', { userId: user.id })
    can('delete', 'Notification', { userId: user.id })

    // ════════════════════════════════════════════
    //  USER
    // ════════════════════════════════════════════

    can('read', 'User') // asosiy ma'lumot hamma ko'radi
    can('update', 'User', { id: user.id }) // o'z profilini tahrirlash

    // Dept head — o'z bo'limi xodimlarini ko'radi
    if (isDeptHead && subordinateDeptIds.length > 0) {
      can('read', 'User', {
        departmentId: { in: subordinateDeptIds },
      } as any)
    }

    // ════════════════════════════════════════════
    //  ATTACHMENT — parent resource asosida
    // ════════════════════════════════════════════

    can('read', 'Attachment')
    can('create', 'Attachment')
    can('delete', 'Attachment', { uploadedById: user.id })

    return build()
  }

  /**
   * Frontend uchun serializatsiya — CASL rules massivi.
   * Frontend'da `createMongoAbility(rules)` bilan qayta ishlatiladi.
   */
  serializeForUser(user: CaslUser): any[] {
    const ability = this.createForUser(user)
    return ability.rules
  }
}
