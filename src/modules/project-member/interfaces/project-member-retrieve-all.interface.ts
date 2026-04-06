export interface ProjectMemberRetrieveAllRequest {
  projectId?: string
  userId?: string
  role?: string
  pageNumber?: number
  pageSize?: number
  search?: string
}

export interface ProjectMemberRetrieveAllResponse {
  data: any[]
  count: number
  pageNumber: number
  pageSize: number
}
