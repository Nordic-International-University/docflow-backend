import { Module } from '@nestjs/common'
import { JournalController } from './journal.controller'
import { JournalService } from './journal.service'
import { PrismaModule } from '@prisma'
import { AuditLogModule } from '../audit-log/audit-log.module'

@Module({
  imports: [PrismaModule, AuditLogModule],
  providers: [JournalService],
  controllers: [JournalController],
})
export class JournalModule {}
