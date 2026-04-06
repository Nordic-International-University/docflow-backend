export interface TaskActivityRetrieveAllRequest {
  taskId: string
  userId?: string
  action?: string
  startDate?: string
  endDate?: string
  pageNumber?: number
  pageSize?: number
}

export interface TaskActivityRetrieveAllResponse {
  data: any[]
  count: number
  pageNumber: number
  pageSize: number
}
