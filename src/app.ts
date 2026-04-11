import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { CaslModule } from './casl'
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
    // Eslatma: barcha 3 profil har requestga parallel qo'llanadi, shuning uchun
    // eng past limit (short) global "bottleneck" bo'ladi. Dashboard bitta sahifada
    // 5-8 parallel so'rov yuboradi, navigatsiya + refresh bilan 100+/min oson chiqadi.
    // Qattiqroq cheklov kerak bo'lsa — endpointga `@Throttle({ short: { ttl, limit } })`
    // dekoratori orqali lokal override qilinadi (masalan, auth.controller.ts).
    ThrottlerModule.forRoot([
      {
        name: 'short',   // burst himoyasi
        ttl: 60000,       // 1 daqiqa oynasi
        limit: 200,       // 200 so'rov / daqiqa
      },
      {
        name: 'medium',  // oddiy API
        ttl: 60000,
        limit: 500,       // 500 so'rov / daqiqa
      },
      {
        name: 'long',    // list/read ko'p chaqiriluvchi endpointlar
        ttl: 60000,
        limit: 1500,      // 1500 so'rov / daqiqa
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
    CaslModule,
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
