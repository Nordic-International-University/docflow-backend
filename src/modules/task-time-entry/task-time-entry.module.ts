import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { TaskTimeEntryService } from './task-time-entry.service'
import { TaskTimeEntryController } from './task-time-entry.controller'
import { AuditLogModule } from '../audit-log/audit-log.module'

@Module({
  imports: [PrismaModule, AuditLogModule],
  providers: [TaskTimeEntryService],
  controllers: [TaskTimeEntryController],
  exports: [TaskTimeEntryService],
})
export class TaskTimeEntryModule {}
