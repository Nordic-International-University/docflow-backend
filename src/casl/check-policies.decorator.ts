/**
 * @CheckPolicies decorator — controller endpoint'lariga ABAC policy qo'yish.
 *
 * Ishlatish:
 *   @CheckPolicies((ability) => ability.can('read', 'Document'))
 *   @CheckPolicies(
 *     (ability) => ability.can('update', 'Document'),
 *     (ability) => ability.can('read', 'Workflow'),
 *   )
 *
 * Har bir handler function true qaytarishi kerak, aks holda 403.
 * PoliciesGuard bu dekorator metadata'sini o'qib, ability.can() chaqiradi.
 */

import { SetMetadata } from '@nestjs/common'
import { AppAbility } from './casl.types'

export type PolicyHandler = (ability: AppAbility) => boolean

export const CHECK_POLICIES_KEY = 'check_policies'

export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers)
