/**
 * Role helper — 23+ joyda takrorlangan isAdmin tekshirishni
 * bitta function'ga to'plash.
 *
 * Oldin har service'da:
 *   const isAdmin =
 *     payload.roleName === ROLE_NAMES.ADMIN ||
 *     payload.roleName === ROLE_NAMES.SUPER_ADMIN
 *
 * Endi:
 *   const admin = isAdmin(payload.roleName)
 */

import { ROLE_NAMES } from '@constants'

const ADMIN_ROLE_NAMES: string[] = [
  ROLE_NAMES.SUPER_ADMIN,
  ROLE_NAMES.ADMIN,
]

/**
 * Foydalanuvchi admin (Super Administrator yoki Admin) mi?
 */
export function isAdmin(roleName?: string | null): boolean {
  return ADMIN_ROLE_NAMES.includes(roleName || '')
}

/**
 * Foydalanuvchi Super Admin mi?
 */
export function isSuperAdmin(roleName?: string | null): boolean {
  return roleName === ROLE_NAMES.SUPER_ADMIN
}

/**
 * Foydalanuvchi HR Menejer mi?
 */
export function isHR(roleName?: string | null): boolean {
  return roleName === ROLE_NAMES.HR_MANAGER
}

/**
 * Admin yoki HR mi?
 */
export function isAdminOrHR(roleName?: string | null): boolean {
  return isAdmin(roleName) || isHR(roleName)
}
