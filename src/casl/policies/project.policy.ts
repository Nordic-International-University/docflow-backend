/**
 * Project ABAC Policy — loyihaga kirish qoidalari.
 *
 * Visibility model:
 *  - PUBLIC: hamma ko'radi
 *  - DEPARTMENT: o'z bo'limidagilar ko'radi
 *  - PRIVATE: faqat a'zolar va yaratuvchi
 */

import { AbilityBuilder } from '@casl/ability'
import { AppAbility, CaslUser, createAppAbility } from '../casl.types'
import { ROLE_NAMES } from '@constants'

export function defineProjectAbility(user: CaslUser): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createAppAbility as any)

  const isAdmin =
    user.roleName === ROLE_NAMES.SUPER_ADMIN ||
    user.roleName === ROLE_NAMES.ADMIN

  if (isAdmin) {
    can('manage', 'Project')
    return build()
  }

  can('create', 'Project')

  // PUBLIC loyihalar — hamma ko'radi
  can('read', 'Project', { visibility: 'PUBLIC' })

  // O'zi yaratgan — hamma holatda ko'radi
  can('read', 'Project', { createdById: user.id })
  can('update', 'Project', { createdById: user.id })
  can('delete', 'Project', { createdById: user.id })

  // DEPARTMENT loyihalar
  if (user.departmentId) {
    can('read', 'Project', {
      visibility: 'DEPARTMENT',
      departmentId: user.departmentId,
    })
  }

  // A'zo bo'lgan loyihalar — Prisma nested `members.some` CASL'da cheklangan,
  // shuning uchun service darajasida qo'shimcha OR qo'shiladi.

  return build()
}
