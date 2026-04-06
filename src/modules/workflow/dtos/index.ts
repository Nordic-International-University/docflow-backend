import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsString,
  IsInt,
  IsOptional,
  IsDateString,
  IsEnum,
  IsArray,
  IsBoolean,
  Min,
  Max,
  IsUUID,
  IsNotEmpty,
  IsPositive,
  ValidateNested,
} from 'class-validator'
import { WorkflowStatus, WorkflowType, StepActionType } from '@prisma/client'
import { Type } from 'class-transformer'

export class WorkflowStepInputDto {
  @ApiProperty({
    description: 'Order of the step in the workflow',
    example: 0,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  order: number

  @ApiProperty({
    description: 'Type of action for this step',
    enum: StepActionType,
    example: StepActionType.APPROVAL,
  })
  @IsEnum(StepActionType)
  @IsNotEmpty()
  actionType: StepActionType

  @ApiPropertyOptional({
    description: 'User ID assigned to this step',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  assignedToUserId?: string

  @ApiPropertyOptional({
    description: 'Due date for completing this step',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string

  @ApiPropertyOptional({
    description: 'Whether this step is rejected',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isRejected?: boolean
}

export class WorkflowCreateDto {
  @ApiProperty({
    description: 'ID of the document to create workflow for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  documentId: string

  @ApiPropertyOptional({
    description:
      'ID of the workflow template to create workflow from. If provided, steps will be generated from the template.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  workflowTemplateId?: string

  @ApiPropertyOptional({
    description: 'Current step order in the workflow',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  currentStepOrder?: number

  @ApiPropertyOptional({
    description: 'Status of the workflow',
    enum: WorkflowStatus,
    example: WorkflowStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(WorkflowStatus)
  status?: WorkflowStatus

  @ApiPropertyOptional({
    description: 'Type of workflow execution (CONSECUTIVE or PARALLEL)',
    enum: WorkflowType,
    example: WorkflowType.CONSECUTIVE,
    default: WorkflowType.CONSECUTIVE,
  })
  @IsOptional()
  @IsEnum(WorkflowType)
  type?: WorkflowType

  @ApiPropertyOptional({
    description: 'Deadline for completing the workflow',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  deadline?: string

  @ApiPropertyOptional({
    description:
      'Array of workflow steps to create. Required if workflowTemplateId is not provided.',
    type: [WorkflowStepInputDto],
    example: [
      {
        order: 1,
        actionType: StepActionType.APPROVAL,
        assignedToUserId: '123e4567-e89b-12d3-a456-426614174000',
        dueDate: '2024-12-31T23:59:59.000Z',
        isRejected: false,
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowStepInputDto)
  steps?: WorkflowStepInputDto[]
}

export class WorkflowUpdateDto {
  @ApiPropertyOptional({
    description: 'Current step order in the workflow',
    example: 1,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  currentStepOrder?: number

  @ApiPropertyOptional({
    description: 'Status of the workflow',
    enum: WorkflowStatus,
    example: WorkflowStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(WorkflowStatus)
  status?: WorkflowStatus

  @ApiPropertyOptional({
    description: 'Type of workflow execution (CONSECUTIVE or PARALLEL)',
    enum: WorkflowType,
    example: WorkflowType.CONSECUTIVE,
  })
  @IsOptional()
  @IsEnum(WorkflowType)
  type?: WorkflowType

  @ApiPropertyOptional({
    description: 'Deadline for completing the workflow',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  deadline?: string
}

export class WorkflowRetrieveAllDto {
  @ApiPropertyOptional({
    description: "Qidiruv: hujjat nomi, raqami yoki tavsifi bo'yicha",
    example: 'buyruq',
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    description: 'Hujjat ID bo\'yicha filtrlash',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  documentId?: string

  @ApiPropertyOptional({
    description: 'Ish jarayoni holati bo\'yicha filtrlash',
    enum: WorkflowStatus,
    example: WorkflowStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(WorkflowStatus)
  status?: WorkflowStatus

  @ApiPropertyOptional({
    description: 'Ish jarayoni turi bo\'yicha filtrlash',
    enum: WorkflowType,
    example: WorkflowType.CONSECUTIVE,
  })
  @IsOptional()
  @IsEnum(WorkflowType)
  type?: WorkflowType

  @ApiPropertyOptional({
    description: 'Hujjat turi ID bo\'yicha filtrlash',
  })
  @IsOptional()
  @IsUUID()
  documentTypeId?: string

  @ApiPropertyOptional({
    description: 'Tayinlangan foydalanuvchi ID bo\'yicha filtrlash',
  })
  @IsOptional()
  @IsUUID()
  assignedToUserId?: string

  @ApiPropertyOptional({
    description: 'Hujjat yaratuvchisi ID bo\'yicha filtrlash',
  })
  @IsOptional()
  @IsUUID()
  createdById?: string

  @ApiPropertyOptional({
    description: 'Bosqich harakatining turi bo\'yicha filtrlash',
    enum: StepActionType,
  })
  @IsOptional()
  @IsEnum(StepActionType)
  stepActionType?: StepActionType

  @ApiPropertyOptional({
    description: 'Boshlanish sanasi (dan)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string

  @ApiPropertyOptional({
    description: 'Tugash sanasi (gacha)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string

  @ApiPropertyOptional({
    description: 'Muddati o\'tganlarni ko\'rsatish (deadline < now va status ACTIVE)',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  overdue?: boolean

  @ApiPropertyOptional({
    description: 'Saralash maydoni',
    example: 'createdAt',
    enum: ['createdAt', 'updatedAt', 'deadline', 'status'],
  })
  @IsOptional()
  @IsString()
  sortBy?: string

  @ApiPropertyOptional({
    description: 'Saralash tartibi',
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc'

  @ApiPropertyOptional({
    description: 'Sahifa raqami',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1

  @ApiPropertyOptional({
    description: 'Sahifadagi elementlar soni',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10
}

export class WorkflowStepUserDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  fullname: string

  @ApiProperty({
    description: 'Username',
    example: 'john.doe',
  })
  username: string
}

export class WorkflowStepDto {
  @ApiProperty({
    description: 'Workflow step ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string

  @ApiProperty({
    description: 'Step order in the workflow',
    example: 1,
  })
  order: number

  @ApiProperty({
    description: 'Step status',
    example: 'IN_PROGRESS',
  })
  status: string

  @ApiProperty({
    description: 'Action type for this step',
    enum: StepActionType,
    example: StepActionType.APPROVAL,
  })
  actionType: StepActionType

  @ApiProperty({
    description: 'Workflow ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  workflowId: string

  @ApiPropertyOptional({
    description: 'User ID assigned to this step',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  assignedToUserId?: string

  @ApiPropertyOptional({
    description: 'User assigned to this step',
    type: WorkflowStepUserDto,
  })
  assignedToUser?: WorkflowStepUserDto

  @ApiPropertyOptional({
    description: 'When the step was started',
    example: '2023-01-01T00:00:00.000Z',
  })
  startedAt?: string

  @ApiPropertyOptional({
    description: 'When the step was completed',
    example: '2023-01-02T00:00:00.000Z',
  })
  completedAt?: string

  @ApiPropertyOptional({
    description: 'Due date for the step',
    example: '2023-01-03T00:00:00.000Z',
  })
  dueDate?: string

  @ApiProperty({
    description: 'Whether the step was rejected',
    example: false,
  })
  isRejected: boolean

  @ApiPropertyOptional({
    description: 'Reason for rejection',
    example: 'Incomplete information',
  })
  rejectionReason?: string

  @ApiPropertyOptional({
    description: 'When the step was rejected',
    example: '2023-01-02T00:00:00.000Z',
  })
  rejectedAt?: string

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: string

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: string
}

export class WorkflowDocumentDto {
  @ApiProperty({
    description: 'Document ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string

  @ApiProperty({
    description: 'Document title',
    example: 'Annual Report 2023',
  })
  title: string

  @ApiPropertyOptional({
    description: 'Document description',
    example: 'Annual financial report for the year 2023',
  })
  description?: string

  @ApiPropertyOptional({
    description: 'Document number',
    example: 'DOC-2023-001',
  })
  documentNumber?: string

  @ApiProperty({
    description: 'Document version',
    example: 1,
  })
  version: number
}

export class WorkflowResponseDto {
  @ApiProperty({
    description: 'Workflow ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string

  @ApiProperty({
    description: 'Document ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  documentId: string

  @ApiProperty({
    description: 'Current step order',
    example: 1,
  })
  currentStepOrder: number

  @ApiProperty({
    description: 'Workflow status',
    enum: WorkflowStatus,
    example: WorkflowStatus.ACTIVE,
  })
  status: WorkflowStatus

  @ApiProperty({
    description: 'Type of workflow execution (CONSECUTIVE or PARALLEL)',
    enum: WorkflowType,
    example: WorkflowType.CONSECUTIVE,
  })
  type: WorkflowType

  @ApiPropertyOptional({
    description: 'Deadline for completing the workflow',
    example: '2024-12-31T23:59:59.000Z',
  })
  deadline?: string

  @ApiProperty({
    description: 'Document details',
    type: WorkflowDocumentDto,
  })
  document: WorkflowDocumentDto

  @ApiProperty({
    description: 'Workflow steps',
    type: [WorkflowStepDto],
  })
  workflowSteps: WorkflowStepDto[]

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: string

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: string

  @ApiPropertyOptional({
    description: 'Deletion timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  deletedAt?: string
}

export class WorkflowListResponseDto {
  @ApiProperty({
    description: 'List of workflows',
    type: [WorkflowResponseDto],
  })
  data: WorkflowResponseDto[]

  @ApiProperty({
    description: 'Total number of workflows',
    example: 100,
  })
  total: number

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number

  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
  })
  totalPages: number

  @ApiProperty({
    description: 'Whether there are more pages',
    example: true,
  })
  hasNext: boolean

  @ApiProperty({
    description: 'Whether there are previous pages',
    example: false,
  })
  hasPrevious: boolean
}

export class WorkflowDeleteDto {
  @ApiProperty({
    description: 'Workflow ID to delete',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  id: string
}

export class WorkflowDeleteResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Workflow deleted successfully',
  })
  message: string

  @ApiProperty({
    description: 'Deleted workflow ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string

  @ApiProperty({
    description: 'Deletion timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  deletedAt: string
}

export class WorkflowAdvanceStepDto {
  @ApiProperty({
    description: 'Workflow ID to advance',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  workflowId: string
}
