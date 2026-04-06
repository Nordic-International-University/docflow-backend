import { Module } from '@nestjs/common'
import { UserMonthlyKpiController } from './user-monthly-kpi.controller'
import { UserMonthlyKpiService } from './user-monthly-kpi.service'
import { KpiCalculationService } from './kpi-calculation.service'
import { PrismaModule } from '@prisma'

@Module({
  imports: [PrismaModule],
  controllers: [UserMonthlyKpiController],
  providers: [UserMonthlyKpiService, KpiCalculationService],
  exports: [UserMonthlyKpiService, KpiCalculationService],
})
export class UserMonthlyKpiModule {}
