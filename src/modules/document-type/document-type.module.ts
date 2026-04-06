import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { DocumentTypeService } from './document-type.service'
import { DocumentTypeController } from './document-type.controller'
import { AuditLogModule } from '../audit-log/audit-log.module'

@Module({
  imports: [PrismaModule, AuditLogModule],
  providers: [DocumentTypeService],
  controllers: [DocumentTypeController],
})
export class DocumentTypeModule {}
