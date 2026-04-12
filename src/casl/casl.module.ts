import { Global, Module } from '@nestjs/common'
import { AbilityFactory } from './ability.factory'
import { DepartmentHierarchyService } from './department-hierarchy.service'
import { PoliciesGuard } from './policies.guard'
import { PrismaModule } from '@prisma'

/**
 * Global CASL module — barcha modullarda inject qilinadi.
 *
 * Provides:
 * - AbilityFactory — user context'dan AppAbility yaratadi
 * - DepartmentHierarchyService — bo'lim ierarxiyasi resolver
 * - PoliciesGuard — @CheckPolicies dekorator uchun guard
 */
@Global()
@Module({
  imports: [PrismaModule],
  providers: [AbilityFactory, DepartmentHierarchyService, PoliciesGuard],
  exports: [AbilityFactory, DepartmentHierarchyService, PoliciesGuard],
})
export class CaslModule {}
