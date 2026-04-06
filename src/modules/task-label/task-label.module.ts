import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { TaskLabelService } from './task-label.service'
import { TaskLabelController } from './task-label.controller'
import { AuditLogModule } from '../audit-log/audit-log.module'

@Module({
  imports: [PrismaModule, AuditLogModule],
  providers: [TaskLabelService],
  controllers: [TaskLabelController],
  exports: [TaskLabelService],
})
export class TaskLabelModule {}
