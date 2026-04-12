import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { RoleService } from './role.service'
import { RoleController } from './role.controller'
import { AuthGuard } from '@guards'
import { AuthService } from 'modules/auth'

@Module({
  imports: [PrismaModule],
  providers: [RoleService],
  controllers: [RoleController],
})
export class RoleModule {}
