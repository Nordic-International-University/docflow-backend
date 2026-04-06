import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { TaskDependencyService } from './task-dependency.service'
import { TaskDependencyController } from './task-dependency.controller'
import { AuditLogModule } from '../audit-log/audit-log.module'

@Module({
  imports: [PrismaModule, AuditLogModule],
  providers: [TaskDependencyService],
  controllers: [TaskDependencyController],
  exports: [TaskDependencyService],
})
export class TaskDependencyModule {}
