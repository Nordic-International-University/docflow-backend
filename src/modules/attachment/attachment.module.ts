import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { AttachmentService } from './attachment.service'
import { AttachmentController } from './attachment.controller'
import { MinioService } from '@clients'

@Module({
  imports: [PrismaModule],
  providers: [AttachmentService, MinioService],
  controllers: [AttachmentController],
  exports: [AttachmentService],
})
export class AttachmentModule {}
