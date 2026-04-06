import { WorkflowType, StepActionType } from '@prisma/client'

export interface WorkflowTemplateStepInput {
  order: number
  actionType: StepActionType
  assignedToUserId?: string
  assignedToRoleId?: string
  assignedToDepartmentId?: string
  dueInDays?: number
  description?: string
  isRequired?: boolean
}

export interface WorkflowTemplateCreateRequest {
  name: string
  description?: string
  documentTypeId?: string
  type?: WorkflowType
  isActive?: boolean
  isPublic?: boolean
  steps: WorkflowTemplateStepInput[]
  createdBy?: string
}

export interface WorkflowTemplateUpdateRequest {
  id: string
  name?: string
  description?: string
  documentTypeId?: string
  type?: WorkflowType
  isActive?: boolean
  isPublic?: boolean
  steps?: WorkflowTemplateStepInput[]
  updatedBy?: string
}

export interface WorkflowTemplateRetrieveAllRequest {
  search?: string
  documentTypeId?: string
  type?: WorkflowType
  isActive?: boolean
  isPublic?: boolean
  page?: number
  limit?: number
}

export interface WorkflowTemplateRetrieveOneRequest {
  id: string
}

export interface WorkflowTemplateDeleteRequest {
  id: string
  deletedBy?: string
}
