import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { TaskCategoryService } from './task-category.service'
import { TaskCategoryController } from './task-category.controller'
import { AuditLogModule } from '../audit-log/audit-log.module'

@Module({
  imports: [PrismaModule, AuditLogModule],
  providers: [TaskCategoryService],
  controllers: [TaskCategoryController],
  exports: [TaskCategoryService],
})
export class TaskCategoryModule {}
