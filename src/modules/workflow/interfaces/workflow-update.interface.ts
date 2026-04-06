import { WorkflowStatus, WorkflowType } from '@prisma/client'

export interface WorkflowUpdateRequest {
  id: string
  documentId?: string
  type?: WorkflowType
  currentStepOrder?: number
  status?: WorkflowStatus
}
