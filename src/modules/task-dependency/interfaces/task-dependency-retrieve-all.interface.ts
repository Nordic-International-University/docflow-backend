export interface TaskDependencyRetrieveAllRequest {
  pageNumber?: number
  pageSize?: number
  taskId?: string
  dependsOnTaskId?: string
}

export interface TaskDependencyRetrieveAllResponse {
  data: any[]
  count: number
  pageNumber: number
  pageSize: number
}
