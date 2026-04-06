import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { DocumentTemplateService } from './document-template.service'
import { DocumentTemplateController } from './document-template.controller'
import { AuditLogModule } from '../audit-log/audit-log.module'

@Module({
  imports: [PrismaModule, AuditLogModule],
  providers: [DocumentTemplateService],
  controllers: [DocumentTemplateController],
})
export class DocumentTemplate {}
