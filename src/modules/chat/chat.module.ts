import { Module, forwardRef } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PrismaModule } from '@prisma'
import { MinioModule, RedisModule } from '@clients'
import { TelegramModule } from '../telegram/telegram.module'
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'
import { ChatGateway } from './chat.gateway'
import { ChatEncryptionService } from './chat-encryption'

@Module({
  imports: [
    PrismaModule,
    JwtModule,
    MinioModule,
    RedisModule,
    forwardRef(() => TelegramModule),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, ChatEncryptionService],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
