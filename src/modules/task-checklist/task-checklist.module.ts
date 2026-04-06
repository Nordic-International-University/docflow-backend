import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { TaskChecklistService } from './task-checklist.service'
import { TaskChecklistController } from './task-checklist.controller'
import { AuditLogModule } from '../audit-log/audit-log.module'

@Module({
  imports: [PrismaModule, AuditLogModule],
  providers: [TaskChecklistService],
  controllers: [TaskChecklistController],
  exports: [TaskChecklistService],
})
export class TaskChecklistModule {}
