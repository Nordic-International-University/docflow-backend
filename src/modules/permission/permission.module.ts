import { Module } from '@nestjs/common'
import { PermissionService } from './permission.service'
import { PrismaModule } from '@prisma'
import { PermissionController } from './permission.controller'

@Module({
  imports: [PrismaModule],
  providers: [PermissionService],
  controllers: [PermissionController],
})
export class PermissionModule {}
