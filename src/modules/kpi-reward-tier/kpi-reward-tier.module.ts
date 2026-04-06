import { Module } from '@nestjs/common'
import { KpiRewardTierController } from './kpi-reward-tier.controller'
import { KpiRewardTierService } from './kpi-reward-tier.service'
import { PrismaModule } from '@prisma'

@Module({
  imports: [PrismaModule],
  controllers: [KpiRewardTierController],
  providers: [KpiRewardTierService],
  exports: [KpiRewardTierService],
})
export class KpiRewardTierModule {}
