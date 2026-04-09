import { Module, forwardRef } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { TaskCommentService } from './task-comment.service'
import { TaskCommentController } from './task-comment.controller'
import { AuditLogModule } from '../audit-log/audit-log.module'
import { TaskModule } from '../task/task.module'
import { NotificationModule } from '../notification/notification.module'

@Module({
  imports: [PrismaModule, AuditLogModule, forwardRef(() => TaskModule), forwardRef(() => NotificationModule)],
  providers: [TaskCommentService],
  controllers: [TaskCommentController],
  exports: [TaskCommentService],
})
export class TaskCommentModule {}
