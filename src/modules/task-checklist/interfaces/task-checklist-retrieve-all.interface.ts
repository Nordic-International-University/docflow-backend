export interface TaskChecklistRetrieveAllRequest {
  taskId: string
  pageNumber?: number
  pageSize?: number
  search?: string
}

export interface TaskChecklistRetrieveAllResponse {
  data: any[]
  count: number
  pageNumber: number
  pageSize: number
}

export interface TaskChecklistItemRetrieveAllRequest {
  checklistId: string
  pageNumber?: number
  pageSize?: number
  search?: string
}

export interface TaskChecklistItemRetrieveAllResponse {
  data: any[]
  count: number
  pageNumber: number
  pageSize: number
}
