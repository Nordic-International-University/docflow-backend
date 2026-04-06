export interface TaskWatcherRetrieveAllRequest {
  pageNumber?: number
  pageSize?: number
  taskId?: string
  userId?: string
}

export interface TaskWatcherRetrieveAllResponse {
  data: any[]
  count: number
  pageNumber: number
  pageSize: number
}
