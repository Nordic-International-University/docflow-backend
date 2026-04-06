import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { WorkflowTemplateController } from './workflow-template.controller'
import { WorkflowTemplateService } from './workflow-template.service'
import { AuditLogModule } from '../audit-log/audit-log.module'

@Module({
  imports: [PrismaModule, AuditLogModule],
  controllers: [WorkflowTemplateController],
  providers: [WorkflowTemplateService],
  exports: [WorkflowTemplateService],
})
export class WorkflowTemplateModule {}
