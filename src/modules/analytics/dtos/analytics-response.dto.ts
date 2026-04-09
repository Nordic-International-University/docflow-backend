import { ApiProperty } from '@nestjs/swagger'

// Common interfaces for response DTOs
export class CountByStatus {
  @ApiProperty({ example: 5 })
  draft: number

  @ApiProperty({ example: 10 })
  pending: number

  @ApiProperty({ example: 8 })
  inReview: number

  @ApiProperty({ example: 25 })
  approved: number

  @ApiProperty({ example: 3 })
  rejected: number

  @ApiProperty({ example: 15 })
  archived: number
}

export class CountByPriority {
  @ApiProperty({ example: 10 })
  low: number

  @ApiProperty({ example: 20 })
  medium: number

  @ApiProperty({ example: 15 })
  high: number

  @ApiProperty({ example: 5 })
  urgent: number
}

export class TrendData {
  @ApiProperty({ example: '2025-01' })
  period: string

  @ApiProperty({ example: 45 })
  count: number
}

// Dashboard Analytics Response
export class MetricWithChange {
  @ApiProperty({ example: 1234, description: 'Current value' })
  value: number

  @ApiProperty({
    example: 12.5,
    description: 'Percentage change compared to previous period',
    nullable: true,
  })
  changePercentage: number | null
}

export class DashboardAnalyticsResponseDto {
  @ApiProperty({
    type: MetricWithChange,
    description: 'Total number of documents',
  })
  totalDocuments: MetricWithChange

  @ApiProperty({
    type: MetricWithChange,
    description: 'Total number of active users',
  })
  activeUsers: MetricWithChange

  @ApiProperty({ description: 'Total number of departments', example: 12 })
  totalDepartments: number

  @ApiProperty({
    type: MetricWithChange,
    description: 'Total number of journals',
  })
  totalJournals: MetricWithChange

  @ApiProperty({
    description: 'Total number of active workflows',
    example: 23,
  })
  activeWorkflows: number

  @ApiProperty({
    type: MetricWithChange,
    description: 'Number of pending workflow steps (eski nom)',
  })
  pendingTasks: MetricWithChange

  @ApiProperty({ type: MetricWithChange, description: 'Pending workflow steps' })
  pendingWorkflowSteps?: MetricWithChange

  @ApiProperty({ type: MetricWithChange, description: 'Jami topshiriqlar' })
  totalTasks?: MetricWithChange

  @ApiProperty({ description: 'Bajarilgan topshiriqlar' })
  completedTasks?: number

  @ApiProperty({ description: "Muddati o'tgan topshiriqlar" })
  overdueTasks?: number

  @ApiProperty({ description: 'Jami loyihalar' })
  totalProjects?: number

  @ApiProperty({ description: 'Bugungi chat xabarlari' })
  chatMessagesToday?: number

  @ApiProperty({ description: 'Jami chat xabarlari' })
  totalChatMessages?: number

  @ApiProperty({ description: "Hujjatlar holati taqsimoti: { DRAFT: 57, APPROVED: 13, ... }" })
  documentsByStatus?: Record<string, number>
}

// Document Analytics Response
export class DocumentByType {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  typeId: string

  @ApiProperty({ example: 'Contract' })
  typeName: string

  @ApiProperty({ example: 25 })
  count: number
}

export class DocumentByDepartment {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  departmentId: string

  @ApiProperty({ example: 'HR' })
  departmentName: string

  @ApiProperty({ example: 15 })
  count: number
}

export class DocumentAnalyticsResponseDto {
  @ApiProperty({ description: 'Total number of documents' })
  totalDocuments: number

  @ApiProperty({ type: CountByStatus })
  documentsByStatus: CountByStatus

  @ApiProperty({ type: CountByPriority })
  documentsByPriority: CountByPriority

  @ApiProperty({ type: [DocumentByType] })
  documentsByType: DocumentByType[]

  @ApiProperty({ type: [DocumentByDepartment] })
  documentsByDepartment: DocumentByDepartment[]

  @ApiProperty({
    type: [TrendData],
    description: 'Document creation trend over time',
  })
  creationTrend: TrendData[]

  @ApiProperty({ description: 'Average documents per day' })
  averageDocumentsPerDay: number

  @ApiProperty({ description: 'Documents with attachments count' })
  documentsWithAttachments: number

  @ApiProperty({ description: 'Total versions count across all documents' })
  totalVersions: number
}

// Workflow Analytics Response
export class WorkflowByStatus {
  @ApiProperty({ example: 10 })
  active: number

  @ApiProperty({ example: 8 })
  paused: number

  @ApiProperty({ example: 25 })
  completed: number

  @ApiProperty({ example: 3 })
  cancelled: number
}

export class StepCompletionRate {
  @ApiProperty({ example: 1 })
  stepOrder: number

  @ApiProperty({ example: 'Initial Review' })
  stepName: string

  @ApiProperty({ example: 95 })
  completionRate: number

  @ApiProperty({ example: 48 })
  averageCompletionTime: number
}

export class WorkflowAnalyticsResponseDto {
  @ApiProperty({ description: 'Total number of workflows' })
  totalWorkflows: number

  @ApiProperty({ type: WorkflowByStatus })
  workflowsByStatus: WorkflowByStatus

  @ApiProperty({
    description: 'Average workflow completion time (in hours)',
  })
  averageCompletionTime: number

  @ApiProperty({ description: 'Workflows completed in period' })
  completedInPeriod: number

  @ApiProperty({ description: 'Workflows cancelled in period' })
  cancelledInPeriod: number

  @ApiProperty({ type: [StepCompletionRate] })
  stepCompletionRates: StepCompletionRate[]

  @ApiProperty({
    type: [TrendData],
    description: 'Workflow completion trend over time',
  })
  completionTrend: TrendData[]

  @ApiProperty({ description: 'Average steps per workflow' })
  averageStepsPerWorkflow: number
}

// User Analytics Response
export class UserActivity {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174002' })
  userId: string

  @ApiProperty({ example: 'john.doe' })
  username: string

  @ApiProperty({ example: 'John Doe' })
  fullName: string

  @ApiProperty({ example: 15 })
  documentsCreated: number

  @ApiProperty({ example: 25 })
  workflowStepsCompleted: number

  @ApiProperty({ example: 5 })
  workflowStepsPending: number
}

export class DepartmentActivity {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174003' })
  departmentId: string

  @ApiProperty({ example: 'HR' })
  departmentName: string

  @ApiProperty({ example: 45 })
  documentsCreated: number

  @ApiProperty({ example: 35 })
  workflowsCompleted: number

  @ApiProperty({ example: 10 })
  activeUsers: number
}

export class UserAnalyticsResponseDto {
  @ApiProperty({ description: 'Total number of active users' })
  totalActiveUsers: number

  @ApiProperty({ type: [UserActivity], description: 'Top active users' })
  topActiveUsers: UserActivity[]

  @ApiProperty({ type: [DepartmentActivity] })
  departmentActivity: DepartmentActivity[]

  @ApiProperty({ description: 'Average documents per user' })
  averageDocumentsPerUser: number

  @ApiProperty({ description: 'Average workflow steps per user' })
  averageWorkflowStepsPerUser: number

  @ApiProperty({
    type: [TrendData],
    description: 'User activity trend over time',
  })
  activityTrend: TrendData[]
}
