/**
 * Document ABAC Policy — hujjat uchun barcha kirish qoidalari.
 *
 * Oldin 25+ joyda takrorlangan OR bloklari bitta joyda to'plangan.
 * O'zgartirish kerak bo'lsa — faqat shu fayl.
 */

import { AbilityBuilder } from '@casl/ability'
import { AppAbility, CaslUser, createAppAbility } from '../casl.types'
import { ROLE_NAMES } from '@constants'

export function defineDocumentAbility(user: CaslUser): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createAppAbility as any)

  const isAdmin =
    user.roleName === ROLE_NAMES.SUPER_ADMIN ||
    user.roleName === ROLE_NAMES.ADMIN

  const isHR = user.roleName === ROLE_NAMES.HR_MANAGER

  // ============ SUPER ADMIN / ADMIN — hamma narsa ============
  if (isAdmin) {
    can('manage', 'Document')
    can('manage', 'Attachment')
    // APPROVED hujjatni ham admin tahrirlay olmaydi
    cannot('update', 'Document', { status: 'APPROVED' })
    cannot('update', 'Document', { status: 'ARCHIVED' })
    return build()
  }

  // ============ HR MENEJER — hamma hujjatni ko'radi ============
  if (isHR) {
    can('read', 'Document')
    can('download', 'Document')
    can('create', 'Document')
    can('update', 'Document', { createdById: user.id, status: 'DRAFT' })
    can('update', 'Document', { createdById: user.id, status: 'REJECTED' })
    can('delete', 'Document', { createdById: user.id, status: 'DRAFT' })
    return build()
  }

  // ============ ODDIY FOYDALANUVCHI ============

  // CREATE — har kim yarata oladi (permission guard tekshiradi)
  can('create', 'Document')

  // READ — faqat o'zi yaratgan yoki workflow'da ishtirok etgan
  can('read', 'Document', { createdById: user.id })
  // Workflow ishtirokchisi sifatida — Prisma nested where
  // CASL/Prisma bu murakkab nested relation'ni to'g'ridan-to'g'ri qo'llamaydi,
  // shuning uchun buni service'da qo'shimcha tekshirish kerak.
  // Lekin asosiy filter — createdById ishlaydi.

  // UPDATE — faqat o'zi yaratgan + DRAFT/REJECTED
  can('update', 'Document', { createdById: user.id, status: 'DRAFT' })
  can('update', 'Document', { createdById: user.id, status: 'REJECTED' })

  // DELETE — faqat o'zi yaratgan DRAFT
  can('delete', 'Document', { createdById: user.id, status: 'DRAFT' })

  // DOWNLOAD — o'zi yaratgan yoki APPROVED
  can('download', 'Document', { createdById: user.id })
  can('download', 'Document', { status: 'APPROVED' })

  // Hech kim APPROVED/ARCHIVED ni tahrirlay olmaydi
  cannot('update', 'Document', { status: 'APPROVED' })
  cannot('update', 'Document', { status: 'ARCHIVED' })
  cannot('delete', 'Document', { status: 'APPROVED' })
  cannot('delete', 'Document', { status: 'ARCHIVED' })

  return build()
}
