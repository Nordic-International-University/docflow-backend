import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { DeadlineService } from './deadline.service'
import { NotificationModule } from '../notification/notification.module'

@Module({
  imports: [PrismaModule, NotificationModule],
  providers: [DeadlineService],
  exports: [DeadlineService],
})
export class DeadlineModule {}
