import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { WorkflowStepService } from './workflow-step.service'
import { WorkflowStepController } from './workflow-step.controller'
import { NotificationModule } from '../notification/notification.module'
import { TelegramModule } from '../telegram/telegram.module'
import { AuditLogModule } from '../audit-log/audit-log.module'

@Module({
  imports: [PrismaModule, NotificationModule, TelegramModule, AuditLogModule],
  controllers: [WorkflowStepController],
  providers: [WorkflowStepService],
})
export class WorkflowStepModule {}
