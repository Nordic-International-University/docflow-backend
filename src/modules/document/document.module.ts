import { Module } from '@nestjs/common'
import {
  DocumentController,
  DocumentPublicController,
} from './document.controller'
import { PrismaModule } from '@prisma'
import { DocumentService } from './document.service'
import { DocumentHistoryService } from './document-history.service'
import { DocumentPublicService } from './document-public.service'
import { WopiModule } from '../wopi/wopi.module'
import { AuditLogModule } from '../audit-log/audit-log.module'

@Module({
  imports: [PrismaModule, WopiModule, AuditLogModule],
  providers: [DocumentService, DocumentHistoryService, DocumentPublicService],
  controllers: [DocumentController, DocumentPublicController],
})
export class DocumentModule {}
