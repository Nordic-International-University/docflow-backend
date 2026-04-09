/**
 * Chat ABAC Policy
 */

import { AbilityBuilder } from '@casl/ability'
import { AppAbility, CaslUser, createAppAbility } from '../casl.types'
import { ROLE_NAMES } from '@constants'

export function defineChatAbility(user: CaslUser): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createAppAbility as any)

  const isAdmin =
    user.roleName === ROLE_NAMES.SUPER_ADMIN ||
    user.roleName === ROLE_NAMES.ADMIN

  if (isAdmin) {
    can('manage', 'Chat')
    can('manage', 'ChatMessage')
    return build()
  }

  // Chat — a'zo bo'lgan chatlarni ko'radi (service'da member check)
  can('read', 'Chat')
  can('create', 'Chat')
  can('send', 'ChatMessage')

  // O'z xabarlarini tahrirlash/o'chirish
  can('update', 'ChatMessage', { senderId: user.id })
  can('delete', 'ChatMessage', { senderId: user.id })

  // Forward
  can('forward', 'ChatMessage')

  // Calls
  can('call', 'Chat')

  return build()
}
