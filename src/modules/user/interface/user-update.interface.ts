export interface UserUpdateRequest {
  id: string
  fullname?: string
  username?: string
  password?: string
  roleId?: string | null
  departmentId?: string | null
  avatarUrl?: string | null
  telegramId?: string | null
  isActive?: boolean
}
