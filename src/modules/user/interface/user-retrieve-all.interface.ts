export interface UserRetrieveAllRequest {
  pageNumber?: string
  pageSize?: string
  search?: string
  departmentId?: string
}

export interface UserList {
  id: string
  fullname: string
  username: string
  avatarUrl?: string
  role?: {
    id: string
    name: string
  }
  department?: {
    id: string
    name: string
  }
  isActive: boolean
  lastLogin: Date | null
  createdAt: Date
}

export interface UserRetrieveAllResponse {
  count: number
  pageNumber: number
  pageSize: number
  pageCount: number
  data: UserList[]
}
