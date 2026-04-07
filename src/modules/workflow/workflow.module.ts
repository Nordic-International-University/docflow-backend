import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { WorkflowService } from './workflow.service'
import { WorkflowController } from './workflow.controller'
import { NotificationModule } from '../notification/notification.module'
import { TelegramModule } from '../telegram/telegram.module'
import { AuditLogModule } from '../audit-log/audit-log.module'
import { MinioService } from '@clients'

@Module({
  imports: [PrismaModule, NotificationModule, TelegramModule, AuditLogModule],
  providers: [WorkflowService, MinioService],
  controllers: [WorkflowController],
})
export class WorkflowModule {}
