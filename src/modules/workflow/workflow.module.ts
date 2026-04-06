import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { WorkflowService } from './workflow.service'
import { WorkflowController } from './workflow.controller'
import { NotificationModule } from '../notification/notification.module'
import { TelegramModule } from '../telegram/telegram.module'
import { AuditLogModule } from '../audit-log/audit-log.module'

@Module({
  imports: [PrismaModule, NotificationModule, TelegramModule, AuditLogModule],
  providers: [WorkflowService],
  controllers: [WorkflowController],
})
export class WorkflowModule {}
