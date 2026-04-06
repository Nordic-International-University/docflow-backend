import { StepActionType, WorkflowStatus, WorkflowType } from '@prisma/client'

export interface WorkflowStepInput {
  order: number
  actionType: StepActionType
  assignedToUserId?: string
  dueDate?: Date | string
  isRejected?: boolean
}

export interface WorkflowCreateRequest {
  documentId: string
  currentStepOrder?: number
  status?: WorkflowStatus
  type?: WorkflowType
  steps: WorkflowStepInput[]
}
