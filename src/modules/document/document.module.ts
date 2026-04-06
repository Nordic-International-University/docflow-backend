import { Module } from '@nestjs/common'
import {
  DocumentController,
  DocumentPublicController,
} from './document.controller'
import { PrismaModule } from '@prisma'
import { DocumentService } from './document.service'
import { WopiModule } from '../wopi/wopi.module'
import { AuditLogModule } from '../audit-log/audit-log.module'

@Module({
  imports: [PrismaModule, WopiModule, AuditLogModule],
  providers: [DocumentService],
  controllers: [DocumentController, DocumentPublicController],
})
export class DocumentModule {}
