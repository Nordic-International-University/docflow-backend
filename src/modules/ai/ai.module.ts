import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { AiController } from './ai.controller'
import { AiService } from './ai.service'
import { GroqService } from './groq.service'
import { AiToolsService } from './ai-tools.service'

@Module({
  imports: [PrismaModule],
  controllers: [AiController],
  providers: [AiService, GroqService, AiToolsService],
  exports: [AiService],
})
export class AiModule {}
