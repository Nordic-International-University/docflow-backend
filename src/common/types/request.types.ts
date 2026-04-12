/**
 * Typed request interfaces — @Req() req: any ni yo'q qilish.
 *
 * AuthGuard dan keyin req.user + PoliciesGuard dan keyin req.ability
 * tipli bo'ladi. Endi har controller'da `any` o'rniga shu ishlatiladi.
 */

import { Request } from 'express'
import type { AppAbility } from '../../casl/casl.types'

export interface AuthenticatedUser {
  userId: string
  username: string
  fullname: string
  roleId: string | null
  roleName: string | undefined
  departmentId: string | null
  departmentName: string | undefined
  permissions: string[]
  sessionId: string
  // ABAC context (AuthGuard tomonidan qo'shiladi)
  subordinateDeptIds: string[]
  ancestorDeptIds: string[]
  isDeptHead: boolean
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser
  ability?: AppAbility
}
