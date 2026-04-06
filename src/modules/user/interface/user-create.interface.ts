export interface UserCreateRequest {
  fullname: string
  username: string
  password: string
  roleId?: string
  departmentId?: string
  avatarUrl?: string
  isActive?: boolean
}
