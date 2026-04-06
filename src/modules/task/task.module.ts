import { Module } from '@nestjs/common'
import { TaskService } from './task.service'
import { TaskController } from './task.controller'
import { PrismaModule } from '@prisma'
import { AuditLogModule } from '../audit-log/audit-log.module'
import { NotificationModule } from '../notification/notification.module'

@Module({
  imports: [PrismaModule, AuditLogModule, NotificationModule],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
