import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { TaskWatcherService } from './task-watcher.service'
import { TaskWatcherController } from './task-watcher.controller'
import { AuditLogModule } from '../audit-log/audit-log.module'

@Module({
  imports: [PrismaModule, AuditLogModule],
  providers: [TaskWatcherService],
  controllers: [TaskWatcherController],
  exports: [TaskWatcherService],
})
export class TaskWatcherModule {}
