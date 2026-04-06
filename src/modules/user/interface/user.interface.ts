export interface UserRequest {
  userId: string
  ipAddress?: string
  userAgent?: string
  permissions: string[]
}
