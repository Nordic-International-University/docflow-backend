import { Module } from '@nestjs/common'
import { KpiRewardController } from './kpi-reward.controller'
import { KpiRewardService } from './kpi-reward.service'
import { PrismaModule } from '@prisma'

@Module({
  imports: [PrismaModule],
  controllers: [KpiRewardController],
  providers: [KpiRewardService],
  exports: [KpiRewardService],
})
export class KpiRewardModule {}
