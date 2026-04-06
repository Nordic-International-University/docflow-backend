import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
  imports: [PrismaModule],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
