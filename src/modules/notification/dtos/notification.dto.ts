import { IsString, IsBoolean, IsOptional, IsEnum } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export enum NotificationType {
  WORKFLOW_STEP_ASSIGNED = 'workflow_step_assigned',
  WORKFLOW_STEP_COMPLETED = 'workflow_step_completed',
  WORKFLOW_STEP_REJECTED = 'workflow_step_rejected',
  WORKFLOW_STEP_REASSIGNED = 'workflow_step_reassigned',
  WORKFLOW_COMPLETED = 'workflow_completed',
  WORKFLOW_STEP_COMMENT = 'workflow_step_comment',
  WORKFLOW_STEP_STARTED = 'workflow_step_started',
  DOCUMENT_APPROVED = 'document_approved',
  DOCUMENT_REJECTED = 'document_rejected',
  TASK_ASSIGNED = 'task_assigned',
  TASK_COMPLETED = 'task_completed',
  TASK_COMMENT = 'task_comment',
  TASK_DUE_SOON = 'task_due_soon',
  DOCUMENT_STATUS = 'document_status',
  CHAT_MESSAGE = 'chat_message',
  PROJECT_MEMBER = 'project_member',
  // Deadline notifications
  WORKFLOW_DEADLINE_APPROACHING = 'workflow_deadline_approaching',
  WORKFLOW_DEADLINE_EXPIRED = 'workflow_deadline_expired',
  WORKFLOW_STEP_DEADLINE_APPROACHING = 'workflow_step_deadline_approaching',
  WORKFLOW_STEP_DEADLINE_EXPIRED = 'workflow_step_deadline_expired',
  TASK_DEADLINE_APPROACHING = 'task_deadline_approaching',
  TASK_DEADLINE_EXPIRED = 'task_deadline_expired',
}

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Foydalanuvchi IDsi',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  userId: string

  @ApiProperty({
    description: 'Bildirishnoma turi',
    enum: NotificationType,
    example: NotificationType.WORKFLOW_STEP_ASSIGNED,
  })
  @IsEnum(NotificationType)
  type: NotificationType

  @ApiProperty({
    description: 'Bildirishnoma sarlavhasi',
    example: 'Yangi Ish Oqimi Bosqichi Tayinlandi',
  })
  @IsString()
  title: string

  @ApiProperty({
    description: 'Bildirishnoma xabari',
    example: '"Shartnoma" hujjati uchun sizga tasdiqlash bosqichi tayinlandi',
  })
  @IsString()
  message: string

  @ApiPropertyOptional({
    description: "Qo'shimcha metadata ma'lumotlari",
    example: {
      workflowStepId: '123e4567-e89b-12d3-a456-426614174000',
      documentId: '123e4567-e89b-12d3-a456-426614174001',
    },
  })
  @IsOptional()
  metadata?: any
}

export class NotificationResponseDto {
  @ApiProperty({
    description: 'Bildirishnoma IDsi',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string

  @ApiProperty({
    description: 'Foydalanuvchi IDsi',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string

  @ApiProperty({
    description: 'Bildirishnoma turi',
    enum: NotificationType,
    example: NotificationType.WORKFLOW_STEP_ASSIGNED,
  })
  type: string

  @ApiProperty({
    description: 'Bildirishnoma sarlavhasi',
    example: 'Yangi Ish Oqimi Bosqichi Tayinlandi',
  })
  title: string

  @ApiProperty({
    description: 'Bildirishnoma xabari',
    example: '"Shartnoma" hujjati uchun sizga tasdiqlash bosqichi tayinlandi',
  })
  message: string

  @ApiPropertyOptional({
    description: "Qo'shimcha metadata ma'lumotlari",
    example: {
      workflowStepId: '123e4567-e89b-12d3-a456-426614174000',
      documentId: '123e4567-e89b-12d3-a456-426614174001',
    },
  })
  metadata?: any

  @ApiProperty({
    description: "Bildirishnoma o'qilganmi",
    example: false,
  })
  isRead: boolean

  @ApiPropertyOptional({
    description: "Bildirishnoma o'qilgan vaqti",
    example: '2024-01-15T10:30:00Z',
  })
  readAt?: string

  @ApiProperty({
    description: 'Yaratilgan vaqti',
    example: '2024-01-15T10:00:00Z',
  })
  createdAt: string

  @ApiProperty({
    description: 'Yangilangan vaqti',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: string
}

export class NotificationListResponseDto {
  @ApiProperty({
    description: "Bildirishnomalar ro'yxati",
    type: [NotificationResponseDto],
  })
  data: NotificationResponseDto[]

  @ApiProperty({
    description: 'Qaytarilgan bildirishnomalar soni',
    example: 10,
  })
  count: number

  @ApiProperty({
    description: "O'qilmagan bildirishnomalar soni",
    example: 5,
  })
  unreadCount: number
}
