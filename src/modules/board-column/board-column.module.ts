import { Module } from '@nestjs/common'
import { BoardColumnService } from './board-column.service'
import { BoardColumnController } from './board-column.controller'
import { PrismaModule } from '@prisma'
import { AuditLogModule } from '../audit-log/audit-log.module'

@Module({
  imports: [PrismaModule, AuditLogModule],
  controllers: [BoardColumnController],
  providers: [BoardColumnService],
  exports: [BoardColumnService],
})
export class BoardColumnModule {}
