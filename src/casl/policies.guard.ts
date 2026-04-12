/**
 * PoliciesGuard — ABAC (CASL) asosidagi ruxsat guard.
 *
 * @CheckPolicies dekoratori metadata'sini o'qib, har policy handler'ini
 * ability bilan chaqiradi. Biri false qaytarsa → 403 ForbiddenException.
 *
 * AuthGuard'dan KEYIN ishlaydi — req.user allaqachon mavjud.
 * PermissionGuard bilan PARALLEL ishlaydi (ikkalasi ham @UseGuards da):
 *   - PermissionGuard → "bu endpoint'ga kirish huquqi bormi?" (string match)
 *   - PoliciesGuard   → "bu operatsiyaga ruxsat bormi?" (ABAC/attribute)
 *
 * Agar @CheckPolicies qo'yilmagan bo'lsa — guard o'tkazadi (backward compat).
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AbilityFactory } from './ability.factory'
import { CHECK_POLICIES_KEY, PolicyHandler } from './check-policies.decorator'
import { CaslUser } from './casl.types'

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly abilityFactory: AbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handlers =
      this.reflector.get<PolicyHandler[] | undefined>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) ?? []

    // @CheckPolicies qo'yilmagan endpoint — o'tkazish (backward compat)
    if (handlers.length === 0) return true

    const request = context.switchToHttp().getRequest()
    const user = request.user

    if (!user) {
      throw new ForbiddenException('User context topilmadi')
    }

    const caslUser: CaslUser = {
      id: user.userId,
      roleName: user.roleName,
      departmentId: user.departmentId,
      subordinateDeptIds: user.subordinateDeptIds,
      ancestorDeptIds: user.ancestorDeptIds,
      isDeptHead: user.isDeptHead,
    }

    const ability = this.abilityFactory.createForUser(caslUser)

    // Attach ability to request — service'larda accessibleBy() uchun
    request.ability = ability

    for (const handler of handlers) {
      if (!handler(ability)) {
        throw new ForbiddenException(
          'Bu operatsiyani bajarish huquqingiz yo\'q',
        )
      }
    }

    return true
  }
}
