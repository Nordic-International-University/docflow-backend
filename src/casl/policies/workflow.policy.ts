/**
 * Workflow ABAC Policy
 */

import { AbilityBuilder } from '@casl/ability'
import { AppAbility, CaslUser, createAppAbility } from '../casl.types'
import { ROLE_NAMES } from '@constants'

export function defineWorkflowAbility(user: CaslUser): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createAppAbility as any)

  const isAdmin =
    user.roleName === ROLE_NAMES.SUPER_ADMIN ||
    user.roleName === ROLE_NAMES.ADMIN

  if (isAdmin) {
    can('manage', 'Workflow')
    can('manage', 'WorkflowStep')
    // Lekin COMPLETED workflow'ni buzish mumkin emas
    cannot('update', 'Workflow', { status: 'COMPLETED' })
    return build()
  }

  // Hamma workflow yarata oladi (o'z hujjatiga)
  can('create', 'Workflow')

  // Read — yaratuvchi yoki step assignee (nested — service check)
  can('read', 'Workflow')

  // Approve/reject — faqat active step assignee (service check)
  can('approve', 'WorkflowStep')
  can('reject', 'WorkflowStep')
  can('sign', 'WorkflowStep')

  // COMPLETED workflow o'zgartirilmaydi
  cannot('update', 'Workflow', { status: 'COMPLETED' })
  cannot('update', 'Workflow', { status: 'CANCELLED' })

  return build()
}
