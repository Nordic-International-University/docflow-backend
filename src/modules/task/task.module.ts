import { Module } from '@nestjs/common'
import { TaskService } from './task.service'
import { TaskController } from './task.controller'
import { TaskGateway } from './task.gateway'
import { PrismaModule } from '@prisma'
import { AuditLogModule } from '../audit-log/audit-log.module'
import { NotificationModule } from '../notification/notification.module'
import { UserMonthlyKpiModule } from '../user-monthly-kpi/user-monthly-kpi.module'

@Module({
  imports: [PrismaModule, AuditLogModule, NotificationModule, UserMonthlyKpiModule],
  controllers: [TaskController],
  providers: [TaskService, TaskGateway],
  exports: [TaskService, TaskGateway],
})
export class TaskModule {}
