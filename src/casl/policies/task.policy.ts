/**
 * Task ABAC Policy
 */

import { AbilityBuilder } from '@casl/ability'
import { AppAbility, CaslUser, createAppAbility } from '../casl.types'
import { ROLE_NAMES } from '@constants'

export function defineTaskAbility(user: CaslUser): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createAppAbility as any)

  const isAdmin =
    user.roleName === ROLE_NAMES.SUPER_ADMIN ||
    user.roleName === ROLE_NAMES.ADMIN

  if (isAdmin) {
    can('manage', 'Task')
    return build()
  }

  can('create', 'Task')
  can('read', 'Task', { createdById: user.id })
  can('update', 'Task', { createdById: user.id })
  can('delete', 'Task', { createdById: user.id })
  can('complete', 'Task', { createdById: user.id })

  // Assignee sifatida — nested where CASL'da cheklangan, service'da tekshiriladi

  return build()
}
