export interface TaskCategoryRetrieveAllRequest {
  pageNumber?: number
  pageSize?: number
  search?: string
  isActive?: boolean
}

export interface TaskCategoryRetrieveAllResponse {
  data: any[]
  count: number
  pageNumber: number
  pageSize: number
}
