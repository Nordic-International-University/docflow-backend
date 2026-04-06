import { Module } from '@nestjs/common'
import { BoardService } from './board.service'
import { BoardController } from './board.controller'
import { PrismaModule } from '@prisma'
import { AuditLogModule } from '../audit-log/audit-log.module'

@Module({
  imports: [PrismaModule, AuditLogModule],
  controllers: [BoardController],
  providers: [BoardService],
  exports: [BoardService],
})
export class BoardModule {}
