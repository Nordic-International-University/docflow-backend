import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class WorkflowStepActionDto {
  @ApiProperty({
    description: 'Action ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string

  @ApiProperty({
    description: 'Action type (STARTED, APPROVED, REJECTED, etc.)',
    example: 'APPROVED',
  })
  actionType: string

  @ApiProperty({
    description: 'User who performed the action',
  })
  performedBy: {
    id: string
    fullname: string
    username: string
  }

  @ApiPropertyOptional({
    description: 'Comment provided with the action',
    example: 'Approved with minor changes',
  })
  comment?: string

  @ApiProperty({
    description: 'When the action was performed',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: string
}

export class WorkflowStepVerificationDto {
  @ApiProperty({
    description: 'Step ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string

  @ApiProperty({
    description: 'Step order in workflow',
    example: 1,
  })
  order: number

  @ApiProperty({
    description: 'Step status',
    example: 'COMPLETED',
  })
  status: string

  @ApiProperty({
    description:
      'Action type (APPROVAL, SIGN, REVIEW, ACKNOWLEDGE, VERIFICATION). All action types allow XFDF editing.',
    example: 'APPROVAL',
  })
  actionType: string

  @ApiPropertyOptional({
    description: 'User assigned to this step',
  })
  assignedToUser?: {
    id: string
    fullname: string
    username: string
  }

  @ApiPropertyOptional({
    description: 'When the step was started',
    example: '2024-01-15T09:00:00.000Z',
  })
  startedAt?: string

  @ApiPropertyOptional({
    description: 'When the step was completed',
    example: '2024-01-15T10:30:00.000Z',
  })
  completedAt?: string

  @ApiProperty({
    description: 'Whether the step was rejected',
    example: false,
  })
  isRejected: boolean

  @ApiPropertyOptional({
    description: 'Rejection reason if rejected',
    example: 'Missing required information',
  })
  rejectionReason?: string

  @ApiProperty({
    description: 'Actions performed on this step',
    type: [WorkflowStepActionDto],
  })
  actions: WorkflowStepActionDto[]
}

export class DocumentPublicVerificationDto {
  @ApiProperty({
    description: 'Document ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string

  @ApiProperty({
    description: 'Document title',
    example: 'Annual Report 2024',
  })
  title: string

  @ApiPropertyOptional({
    description: 'Document description',
    example: 'Comprehensive annual financial report',
  })
  description?: string

  @ApiPropertyOptional({
    description: 'Document number',
    example: 'DOC-2024-001',
  })
  documentNumber?: string

  @ApiProperty({
    description: 'Document status',
    example: 'APPROVED',
  })
  status: string

  @ApiProperty({
    description: 'Document type',
  })
  documentType: {
    id: string
    name: string
  }

  @ApiProperty({
    description: 'Created by user',
  })
  createdBy: {
    id: string
    fullname: string
    username: string
  }

  @ApiProperty({
    description: 'Document creation date',
    example: '2024-01-10T00:00:00.000Z',
  })
  createdAt: string

  @ApiPropertyOptional({
    description: 'Workflow information',
  })
  workflow?: {
    id: string
    status: string
    type: string
    currentStepOrder: number
    steps: WorkflowStepVerificationDto[]
    createdAt: string
    updatedAt: string
  }
}
