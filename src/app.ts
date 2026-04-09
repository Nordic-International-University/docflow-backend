import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { ConfigModule, ConfigService } from '@nestjs/config'
import {
  UserModule,
  PermissionModule,
  RoleModule,
  DepartmentModule,
  AuthModule,
  DocumentModule,
  DocumentTemplate,
  DocumentTypeModule,
  AttachmentModule,
  JournalModule,
  WorkflowModule,
  WorkflowStepModule,
  WorkflowTemplateModule,
  AnalyticsModule,
  WopiModule,
  AuditLogModule,
  NotificationModule,
  ProjectModule,
  TaskModule,
  TaskCategoryModule,
  ProjectMemberModule,
  ProjectLabelModule,
  TaskLabelModule,
  TaskCommentModule,
  TaskAttachmentModule,
  TaskWatcherModule,
  TaskChecklistModule,
  TaskDependencyModule,
  TaskTimeEntryModule,
  TaskActivityModule,
  SessionModule,
  BoardColumnModule,
  BoardModule,
  TaskScoreConfigModule,
  KpiRewardTierModule,
  UserMonthlyKpiModule,
  KpiRewardModule,
  AiModule,
  ChatModule,
} from '@modules'
import { databaseConfig, jwtConfig, minioConfig, redisConfig } from '@config'
import { JwtModule } from '@nestjs/jwt'
import { ThrottlerModule } from '@nestjs/throttler'
import { CustomThrottlerGuard } from './guards/throttler.guard'
import { APP_GUARD } from '@nestjs/core'
import { RedisModule } from '@clients'
import { MulterModule } from '@nestjs/platform-express'
import * as multer from 'multer'

console.log('Sandbox mode is active.')

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, minioConfig, redisConfig],
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.accessSecret'),
        signOptions: {
          expiresIn: configService.get<number>('jwt.accessExpiresIn'),
        },
      }),
    }),
    // Rate limiting — brute force va DoS himoyasi
    ThrottlerModule.forRoot([
      {
        name: 'short',   // qisqa muddatli — login/auth uchun
        ttl: 60000,       // 1 daqiqa oynasi
        limit: 10,        // 10 so'rov / daqiqa
      },
      {
        name: 'medium',  // o'rtacha — oddiy API uchun
        ttl: 60000,
        limit: 60,        // 60 so'rov / daqiqa
      },
      {
        name: 'long',    // uzun — list/read uchun
        ttl: 60000,
        limit: 120,       // 120 so'rov / daqiqa
      },
    ]),
    MulterModule.register({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50 MB
        files: 10,                   // maks 10 fayl bir so'rovda
      },
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    UserModule,
    RoleModule,
    PermissionModule,
    DepartmentModule,
    DocumentTypeModule,
    DocumentModule,
    DocumentTemplate,
    JournalModule,
    AttachmentModule,
    WorkflowModule,
    WorkflowStepModule,
    WorkflowTemplateModule,
    AnalyticsModule,
    WopiModule,
    AuditLogModule,
    NotificationModule,
    ProjectModule,
    TaskModule,
    TaskCategoryModule,
    ProjectMemberModule,
    ProjectLabelModule,
    TaskLabelModule,
    TaskCommentModule,
    TaskAttachmentModule,
    TaskWatcherModule,
    TaskChecklistModule,
    TaskDependencyModule,
    TaskTimeEntryModule,
    TaskActivityModule,
    SessionModule,
    BoardColumnModule,
    BoardModule,
    TaskScoreConfigModule,
    KpiRewardTierModule,
    UserMonthlyKpiModule,
    KpiRewardModule,
    AiModule,
    ChatModule,
  ],
  providers: [
    // Global rate limiting — barcha endpointlarga qo'llanadi
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class App {}
