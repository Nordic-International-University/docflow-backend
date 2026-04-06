import { Module } from '@nestjs/common'
import { TaskScoreConfigController } from './task-score-config.controller'
import { TaskScoreConfigService } from './task-score-config.service'
import { PrismaModule } from '@prisma'

@Module({
  imports: [PrismaModule],
  controllers: [TaskScoreConfigController],
  providers: [TaskScoreConfigService],
  exports: [TaskScoreConfigService],
})
export class TaskScoreConfigModule {}
