export interface TaskCommentRetrieveAllRequest {
  taskId: string
  pageNumber?: number
  pageSize?: number
}

export interface TaskCommentRetrieveAllResponse {
  data: any[]
  count: number
  pageNumber: number
  pageSize: number
}
