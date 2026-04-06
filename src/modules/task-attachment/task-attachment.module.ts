import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { TaskAttachmentService } from './task-attachment.service'
import { TaskAttachmentController } from './task-attachment.controller'
import { AuditLogModule } from '../audit-log/audit-log.module'
import { AttachmentModule } from '../attachment/attachment.module'

@Module({
  imports: [PrismaModule, AuditLogModule, AttachmentModule],
  providers: [TaskAttachmentService],
  controllers: [TaskAttachmentController],
  exports: [TaskAttachmentService],
})
export class TaskAttachmentModule {}
