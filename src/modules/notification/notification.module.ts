import { Module, forwardRef } from '@nestjs/common'
import { NotificationService } from './notification.service'
import { NotificationController } from './notification.controller'
import { NotificationGateway } from './notification.gateway'
import { PrismaModule } from '@prisma'
import { JwtModule } from '@nestjs/jwt'
import { RedisModule } from '@clients'
import { TelegramModule } from '../telegram/telegram.module'

@Module({
  imports: [
    PrismaModule,
    JwtModule,
    RedisModule,
    forwardRef(() => TelegramModule),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationGateway],
  exports: [NotificationService, NotificationGateway],
})
export class NotificationModule {}
