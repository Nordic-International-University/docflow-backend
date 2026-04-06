export interface TaskLabelRetrieveAllRequest {
  pageNumber?: number
  pageSize?: number
  taskId?: string
  labelId?: string
}

export interface TaskLabelRetrieveAllResponse {
  data: any[]
  count: number
  pageNumber: number
  pageSize: number
}
