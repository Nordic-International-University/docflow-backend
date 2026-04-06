export interface RoleRetrieveAllRequest {
  pageSize: number
  pageNumber: number
  search: string
}

export interface PermissionList {
  id: string
  name: string
}

export interface RoleList {
  id: string
  name: string
  description: string
  permissions: PermissionList[]
  users: number
}

export interface RoleRetrieveAllResponse {
  count: number
  pageSize: number
  pageNumber: number
  pageCount: number
  data: RoleList[]
}
