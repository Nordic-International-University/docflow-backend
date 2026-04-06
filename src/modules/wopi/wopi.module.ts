import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { MinioModule } from '@clients'
import { JwtModule } from '@nestjs/jwt'
import { WopiController } from './wopi.controller'
import { WopiService } from './wopi.service'
import { WopiTokenService } from './wopi-token.service'
import { WorkflowPermissionService } from './workflow-permission.service'
import { WopiAuthGuard, AuthGuard } from '@guards'

@Module({
  imports: [PrismaModule, MinioModule, JwtModule],
  providers: [
    WopiService,
    WopiTokenService,
    WorkflowPermissionService,
    WopiAuthGuard,
    AuthGuard,
  ],
  controllers: [WopiController],
  exports: [WopiService, WopiTokenService, WorkflowPermissionService],
})
export class WopiModule {}
