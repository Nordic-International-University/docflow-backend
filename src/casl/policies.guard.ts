/**
 * PoliciesGuard — ABAC guard.
 * @CheckPolicies dekoratori metadata'sini o'qib, har policy handler'ini
 * ability bilan chaqiradi.
 **/

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
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
    if (handlers.length === 0) return true

    const request = context.switchToHttp().getRequest()
    const user = request.user

    if (!user) {
      throw new BadRequestException("Foydalanuvchi ma'lumotlari topilmadi")
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

    request.ability = ability

    for (const handler of handlers) {
      if (!handler(ability)) {
        throw new BadRequestException(
          'Bu amalni bajarish uchun sizda ruxsat mavjud emas',
        )
      }
    }

    return true
  }
}
