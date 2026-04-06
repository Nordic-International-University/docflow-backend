import { Module } from '@nestjs/common'
import { DepartmentController } from './department.controller'
import { DepartmentService } from './department.service'
import { PrismaModule } from '@prisma'
import { AuditLogModule } from '../audit-log/audit-log.module'

@Module({
  imports: [PrismaModule, AuditLogModule],
  providers: [DepartmentService],
  controllers: [DepartmentController],
})
export class DepartmentModule {}
