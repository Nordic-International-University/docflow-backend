import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { JwtModule } from '@nestjs/jwt'
import { AuthGuard } from '@guards'
import { TelegramModule } from '../telegram/telegram.module'
import { AuditLogModule } from '../audit-log/audit-log.module'

@Module({
  imports: [
    JwtModule.register({
      global: true, // Makes JwtService available globally
      secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
      signOptions: { expiresIn: '8h' },
    }),
    PrismaModule,
    TelegramModule,
    AuditLogModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
