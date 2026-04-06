export interface WorkflowRetrieveAllRequest {
  pageNumber?: number
  pageSize?: number
  search?: string
}

export interface WorkflowList {
  id: string
  documentId: string
}

export interface JournalRetrieveAllResponse {
  count: number
  pageNumber: number
  pageSize: number
  pageCount: number
  data: WorkflowList[]
}
