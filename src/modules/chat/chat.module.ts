import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PrismaModule } from '@prisma'
import { MinioModule } from '@clients'
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'
import { ChatGateway } from './chat.gateway'
import { ChatEncryptionService } from './chat-encryption'

@Module({
  imports: [PrismaModule, JwtModule, MinioModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, ChatEncryptionService],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
