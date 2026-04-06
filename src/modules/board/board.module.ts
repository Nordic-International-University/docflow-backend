import { Module, forwardRef } from '@nestjs/common'
import { BoardService } from './board.service'
import { BoardController } from './board.controller'
import { PrismaModule } from '@prisma'
import { AuditLogModule } from '../audit-log/audit-log.module'
import { TaskModule } from '../task/task.module'

@Module({
  imports: [PrismaModule, AuditLogModule, forwardRef(() => TaskModule)],
  controllers: [BoardController],
  providers: [BoardService],
  exports: [BoardService],
})
export class BoardModule {}
