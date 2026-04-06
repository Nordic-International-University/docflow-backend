export interface ProjectLabelRetrieveAllRequest {
  projectId?: string
  pageNumber?: number
  pageSize?: number
  search?: string
}

export interface ProjectLabelRetrieveAllResponse {
  data: any[]
  count: number
  pageNumber: number
  pageSize: number
}
