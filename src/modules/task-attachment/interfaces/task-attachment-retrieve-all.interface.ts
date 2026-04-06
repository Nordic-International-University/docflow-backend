export interface TaskAttachmentRetrieveAllRequest {
  pageNumber?: number
  pageSize?: number
  taskId?: string
}

export interface TaskAttachmentRetrieveAllResponse {
  data: any[]
  count: number
  pageNumber: number
  pageSize: number
}
