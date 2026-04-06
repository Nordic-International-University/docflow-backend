import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { ProjectLabelService } from './project-label.service'
import { ProjectLabelController } from './project-label.controller'
import { AuditLogModule } from '../audit-log/audit-log.module'

@Module({
  imports: [PrismaModule, AuditLogModule],
  providers: [ProjectLabelService],
  controllers: [ProjectLabelController],
  exports: [ProjectLabelService],
})
export class ProjectLabelModule {}
