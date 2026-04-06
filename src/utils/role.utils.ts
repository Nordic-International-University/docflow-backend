import { ROLE_NAMES } from '@constants'

export class RoleUtils {
  /**
   * Check if user is a super admin or admin
   * Super Admin and Admin bypass user/department filters
   */
  static isSuperAdminOrAdmin(roleName: string): boolean {
    return roleName === ROLE_NAMES.SUPER_ADMIN || roleName === ROLE_NAMES.ADMIN
  }

  /**
   * Check if user is strictly a super admin
   * Only Super Admin can perform certain unrestricted operations
   */
  static isSuperAdmin(roleName: string): boolean {
    return roleName === ROLE_NAMES.SUPER_ADMIN
  }
}
