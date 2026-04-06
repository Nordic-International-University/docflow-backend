export interface PermissionRetrieveAllRequest {
  pageNumber?: number
  pageSize?: number
  search?: string
}

export interface PermissionList {
  id: string
  name: string
  key: string
  module: string
  description: string
}

export interface PermissionRetrieveAllResponse {
  count: number
  pageNumber: number
  pageSize: number
  pageCount: number
  data: PermissionList[]
}
