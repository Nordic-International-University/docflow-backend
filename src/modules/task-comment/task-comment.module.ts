import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { TaskCommentService } from './task-comment.service'
import { TaskCommentController } from './task-comment.controller'
import { AuditLogModule } from '../audit-log/audit-log.module'

@Module({
  imports: [PrismaModule, AuditLogModule],
  providers: [TaskCommentService],
  controllers: [TaskCommentController],
  exports: [TaskCommentService],
})
export class TaskCommentModule {}
