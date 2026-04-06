import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  Min,
  Max,
  IsUUID,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator'
import { WorkflowType, StepActionType } from '@prisma/client'
import { Type } from 'class-transformer'

// Step Input DTO for creating/updating template steps
export class WorkflowTemplateStepInputDto {
  @ApiProperty({
    description: 'Order of the step in the workflow template',
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
    description: 'Role ID assigned to this step',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  assignedToRoleId?: string

  @ApiPropertyOptional({
    description: 'Department ID assigned to this step',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  assignedToDepartmentId?: string

  @ApiPropertyOptional({
    description: 'Number of days allowed to complete this step',
    example: 3,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  dueInDays?: number

  @ApiPropertyOptional({
    description: 'Description of the step',
    example: 'Manager approval required',
  })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({
    description: 'Whether this step is required',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean
}

// Create DTO
export class WorkflowTemplateCreateDto {
  @ApiProperty({
    description: 'Name of the workflow template',
    example: 'Standard Approval Workflow',
  })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional({
    description: 'Description of the workflow template',
    example: 'A standard 3-step approval workflow for general documents',
  })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({
    description: 'Document type ID this template is associated with',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  documentTypeId?: string

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
    description: 'Whether the template is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiPropertyOptional({
    description: 'Whether the template is publicly available',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean

  @ApiProperty({
    description: 'Array of workflow template steps',
    type: [WorkflowTemplateStepInputDto],
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => WorkflowTemplateStepInputDto)
  steps: WorkflowTemplateStepInputDto[]
}

// Update DTO
export class WorkflowTemplateUpdateDto {
  @ApiPropertyOptional({
    description: 'Name of the workflow template',
    example: 'Standard Approval Workflow',
  })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({
    description: 'Description of the workflow template',
    example: 'A standard 3-step approval workflow for general documents',
  })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({
    description: 'Document type ID this template is associated with',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  documentTypeId?: string

  @ApiPropertyOptional({
    description: 'Type of workflow execution (CONSECUTIVE or PARALLEL)',
    enum: WorkflowType,
    example: WorkflowType.CONSECUTIVE,
  })
  @IsOptional()
  @IsEnum(WorkflowType)
  type?: WorkflowType

  @ApiPropertyOptional({
    description: 'Whether the template is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiPropertyOptional({
    description: 'Whether the template is publicly available',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean

  @ApiPropertyOptional({
    description: 'Array of workflow template steps (replaces existing steps)',
    type: [WorkflowTemplateStepInputDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowTemplateStepInputDto)
  steps?: WorkflowTemplateStepInputDto[]
}

// Retrieve All DTO
export class WorkflowTemplateRetrieveAllDto {
  @ApiPropertyOptional({
    description: 'Search by name or description',
    example: 'approval',
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    description: 'Filter by document type ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  documentTypeId?: string

  @ApiPropertyOptional({
    description: 'Filter by workflow type',
    enum: WorkflowType,
    example: WorkflowType.CONSECUTIVE,
  })
  @IsOptional()
  @IsEnum(WorkflowType)
  type?: WorkflowType

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean

  @ApiPropertyOptional({
    description: 'Filter by public status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPublic?: boolean

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1

  @ApiPropertyOptional({
    description: 'Number of items per page',
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

// Response DTOs
export class WorkflowTemplateStepUserDto {
  @ApiProperty({ description: 'User ID' })
  id: string

  @ApiProperty({ description: 'User full name' })
  fullname: string

  @ApiProperty({ description: 'Username' })
  username: string
}

export class WorkflowTemplateStepRoleDto {
  @ApiProperty({ description: 'Role ID' })
  id: string

  @ApiProperty({ description: 'Role name' })
  name: string
}

export class WorkflowTemplateStepDepartmentDto {
  @ApiProperty({ description: 'Department ID' })
  id: string

  @ApiProperty({ description: 'Department name' })
  name: string
}

export class WorkflowTemplateStepResponseDto {
  @ApiProperty({ description: 'Step ID' })
  id: string

  @ApiProperty({ description: 'Step order' })
  order: number

  @ApiProperty({ description: 'Action type', enum: StepActionType })
  actionType: StepActionType

  @ApiPropertyOptional({
    description: 'Assigned user',
    type: WorkflowTemplateStepUserDto,
  })
  assignedToUser?: WorkflowTemplateStepUserDto

  @ApiPropertyOptional({
    description: 'Assigned role',
    type: WorkflowTemplateStepRoleDto,
  })
  assignedToRole?: WorkflowTemplateStepRoleDto

  @ApiPropertyOptional({
    description: 'Assigned department',
    type: WorkflowTemplateStepDepartmentDto,
  })
  assignedToDepartment?: WorkflowTemplateStepDepartmentDto

  @ApiPropertyOptional({ description: 'Days allowed to complete step' })
  dueInDays?: number

  @ApiPropertyOptional({ description: 'Step description' })
  description?: string

  @ApiProperty({ description: 'Whether step is required' })
  isRequired: boolean

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: string

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: string
}

export class WorkflowTemplateDocumentTypeDto {
  @ApiProperty({ description: 'Document type ID' })
  id: string

  @ApiProperty({ description: 'Document type name' })
  name: string
}

export class WorkflowTemplateResponseDto {
  @ApiProperty({ description: 'Template ID' })
  id: string

  @ApiProperty({ description: 'Template name' })
  name: string

  @ApiPropertyOptional({ description: 'Template description' })
  description?: string

  @ApiPropertyOptional({
    description: 'Associated document type',
    type: WorkflowTemplateDocumentTypeDto,
  })
  documentType?: WorkflowTemplateDocumentTypeDto

  @ApiProperty({ description: 'Workflow type', enum: WorkflowType })
  type: WorkflowType

  @ApiProperty({ description: 'Whether template is active' })
  isActive: boolean

  @ApiProperty({ description: 'Whether template is public' })
  isPublic: boolean

  @ApiProperty({
    description: 'Template steps',
    type: [WorkflowTemplateStepResponseDto],
  })
  steps: WorkflowTemplateStepResponseDto[]

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: string

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: string
}

export class WorkflowTemplateListResponseDto {
  @ApiProperty({
    description: 'List of workflow templates',
    type: [WorkflowTemplateResponseDto],
  })
  data: WorkflowTemplateResponseDto[]

  @ApiProperty({ description: 'Total number of templates' })
  total: number

  @ApiProperty({ description: 'Current page number' })
  page: number

  @ApiProperty({ description: 'Number of items per page' })
  limit: number

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number

  @ApiProperty({ description: 'Whether there are more pages' })
  hasNext: boolean

  @ApiProperty({ description: 'Whether there are previous pages' })
  hasPrevious: boolean
}
