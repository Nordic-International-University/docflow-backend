import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { TaskActivityService } from './task-activity.service'
import { TaskActivityController } from './task-activity.controller'

@Module({
  imports: [PrismaModule],
  providers: [TaskActivityService],
  controllers: [TaskActivityController],
  exports: [TaskActivityService],
})
export class TaskActivityModule {}
