import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsPositive,
} from 'class-validator'
import { StepActionType } from '@prisma/client'

export class WorkflowStepCreateDto {
  @ApiProperty()
  @IsInt()
  order: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string

  @ApiProperty({ enum: StepActionType })
  @IsEnum(StepActionType)
  actionType: StepActionType

  @ApiProperty()
  @IsString()
  workflowId: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedToUserId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startedAt?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  completedAt?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRejected?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rejectionReason?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  rejectedAt?: string
}

export class WorkflowStepUpdateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  order?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string

  @ApiPropertyOptional({ enum: StepActionType })
  @IsOptional()
  @IsEnum(StepActionType)
  actionType?: StepActionType

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedToUserId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startedAt?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  completedAt?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRejected?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rejectionReason?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  rejectedAt?: string
}

export class WorkflowStepRetrieveAllDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workflowId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedToUserId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string

  @ApiPropertyOptional()
  @IsPositive()
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  pageNumber?: number

  @ApiPropertyOptional()
  @IsPositive()
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  pageSize?: number

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string
}

export class WorkflowStepAttachmentResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  workflowStepId: string

  @ApiProperty()
  attachmentId: string

  @ApiPropertyOptional()
  comment?: string

  @ApiProperty()
  uploadedByUserId: string

  @ApiPropertyOptional()
  uploadedBy?: {
    id: string
    fullname: string
    username: string
  }

  @ApiPropertyOptional()
  attachment?: {
    id: string
    fileName: string
    fileUrl: string
    fileSize: number
    mimeType: string
  }

  @ApiProperty()
  createdAt: string

  @ApiProperty()
  updatedAt: string
}

export class WorkflowStepResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  order: number

  @ApiProperty()
  status: string

  @ApiProperty({ enum: StepActionType })
  actionType: StepActionType

  @ApiProperty()
  workflowId: string

  @ApiPropertyOptional()
  assignedToUserId?: string

  @ApiPropertyOptional()
  startedAt?: string

  @ApiPropertyOptional()
  completedAt?: string

  @ApiPropertyOptional()
  dueDate?: string

  @ApiProperty()
  isRejected: boolean

  @ApiPropertyOptional()
  rejectionReason?: string

  @ApiPropertyOptional()
  rejectedAt?: string

  @ApiPropertyOptional({ type: [WorkflowStepAttachmentResponseDto] })
  attachments?: WorkflowStepAttachmentResponseDto[]

  @ApiProperty()
  createdAt: string

  @ApiProperty()
  updatedAt: string
}

export class WorkflowStepListResponseDto {
  @ApiProperty({ type: [WorkflowStepResponseDto] })
  data: WorkflowStepResponseDto[]

  @ApiProperty()
  count: number

  @ApiProperty()
  pageNumber: number

  @ApiProperty()
  pageSize: number

  @ApiProperty()
  pageCount: number
}

export class WorkflowStepDeleteDto {
  @ApiProperty()
  @IsString()
  id: string
}

// Workflow Step Action DTOs
export enum WorkflowStepActionType {
  STARTED = 'STARTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REASSIGNED = 'REASSIGNED',
  COMMENTED = 'COMMENTED',
  DELEGATED = 'DELEGATED',
}

export class WorkflowStepActionCreateDto {
  @ApiProperty()
  @IsString()
  workflowStepId: string

  @ApiProperty({ enum: WorkflowStepActionType })
  @IsEnum(WorkflowStepActionType)
  actionType: WorkflowStepActionType

  @ApiProperty()
  @IsString()
  performedByUserId: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: any
}

export class WorkflowStepActionResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  workflowStepId: string

  @ApiProperty({ enum: WorkflowStepActionType })
  actionType: WorkflowStepActionType

  @ApiProperty()
  performedByUserId: string

  @ApiPropertyOptional()
  performedBy?: {
    id: string
    fullname: string
    username: string
    avatarUrl?: string
  }

  @ApiPropertyOptional()
  workflowStep?: {
    id: string
    order: number
    status: string
    actionType: string
  }

  @ApiPropertyOptional()
  comment?: string

  @ApiPropertyOptional()
  metadata?: any

  @ApiProperty()
  createdAt: string

  @ApiProperty()
  updatedAt: string
}

export class WorkflowStepActionListResponseDto {
  @ApiProperty({ type: [WorkflowStepActionResponseDto] })
  data: WorkflowStepActionResponseDto[]

  @ApiProperty()
  count: number

  @ApiProperty()
  pageNumber: number

  @ApiProperty()
  pageSize: number

  @ApiProperty()
  pageCount: number
}

export class WorkflowStepApproveDto {
  @ApiPropertyOptional({
    description: 'Optional comment about the approval',
    example: 'Approved - all requirements met',
  })
  @IsOptional()
  @IsString()
  comment?: string
}

export class WorkflowStepRejectDto {
  @ApiProperty({
    description: 'Reason for rejecting the workflow step',
    example: 'Document requires additional details in section 3',
  })
  @IsString()
  rejectionReason: string

  @ApiPropertyOptional({
    description: 'Additional comment about the rejection',
    example: 'Please review and add the missing financial data',
  })
  @IsOptional()
  @IsString()
  comment?: string

  @ApiPropertyOptional({
    description:
      'User ID from a previous workflow step to rollback to for re-review. The workflow will reset to the step where this user was assigned. Only works for CONSECUTIVE workflows.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  rollbackToUserId?: string

  @ApiPropertyOptional({
    description:
      'Set to true to reject to the workflow creator for review. The workflow will be sent back to the creator step (order -1) which can be accessed outside the normal workflow sequence.',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  rejectToCreator?: boolean
}

export class WorkflowStepVerifyDto {
  @ApiPropertyOptional({
    description: 'Optional comment about the verification',
    example: 'Work completed and verified with attached photos',
  })
  @IsOptional()
  @IsString()
  comment?: string
}

// Calendar DTOs
export class WorkflowStepCalendarDto {
  @ApiPropertyOptional({
    description: 'Start date for the calendar range (ISO 8601 format)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiPropertyOptional({
    description: 'End date for the calendar range (ISO 8601 format)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string

  @ApiPropertyOptional({
    description: 'Filter by workflow step status',
    example: 'IN_PROGRESS',
  })
  @IsOptional()
  @IsString()
  status?: string
}

export class WorkflowStepCalendarItemDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  order: number

  @ApiProperty()
  status: string

  @ApiProperty({ enum: StepActionType })
  actionType: StepActionType

  @ApiProperty()
  workflowId: string

  @ApiPropertyOptional()
  assignedToUserId?: string

  @ApiPropertyOptional()
  dueDate?: string

  @ApiProperty()
  isRejected: boolean

  @ApiPropertyOptional()
  workflow?: any

  @ApiProperty()
  createdAt: string

  @ApiProperty()
  updatedAt: string
}

export class WorkflowStepCalendarResponseDto {
  @ApiProperty({
    description: 'Date in ISO format (YYYY-MM-DD)',
    example: '2024-01-15',
  })
  date: string

  @ApiProperty({
    type: [WorkflowStepCalendarItemDto],
    description: 'List of workflow steps for this date',
  })
  workflowSteps: WorkflowStepCalendarItemDto[]

  @ApiProperty({
    description: 'Total count of workflow steps for this date',
  })
  count: number
}

export class WorkflowStepCalendarListResponseDto {
  @ApiProperty({
    type: [WorkflowStepCalendarResponseDto],
    description: 'Calendar data grouped by date',
  })
  data: WorkflowStepCalendarResponseDto[]

  @ApiProperty({
    description: 'Total count of all workflow steps in the date range',
  })
  totalCount: number

  @ApiProperty({
    description: 'Number of days with workflow steps',
  })
  daysWithSteps: number
}
