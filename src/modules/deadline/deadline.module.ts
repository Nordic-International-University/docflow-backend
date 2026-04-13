import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { DeadlineService } from './deadline.service'
import { DeadlineSettingsService } from './deadline-settings.service'
import { DeadlineSettingsController } from './deadline-settings.controller'
import { NotificationModule } from '../notification/notification.module'

@Module({
  imports: [PrismaModule, NotificationModule],
  providers: [DeadlineService, DeadlineSettingsService],
  controllers: [DeadlineSettingsController],
  exports: [DeadlineService, DeadlineSettingsService],
})
export class DeadlineModule {}
