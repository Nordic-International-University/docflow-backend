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
} from '@modules'
import { databaseConfig, jwtConfig, minioConfig, redisConfig } from '@config'
import { JwtModule } from '@nestjs/jwt'
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
    MulterModule.register({
      storage: multer.memoryStorage(),
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
  ],
})
export class App {}
