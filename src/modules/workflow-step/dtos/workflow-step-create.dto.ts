import { WorkflowStepCreateRequest } from '../interfaces'

export class WorkflowStepCreateDto implements WorkflowStepCreateRequest {
  workflowId: string
}
