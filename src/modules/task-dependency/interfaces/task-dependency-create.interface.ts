export interface TaskDependencyCreateRequest {
  taskId: string
  dependsOnTaskId: string
  createdBy?: string
}
