export interface RoleUpdateRequest {
  id: string
  name?: string
  description?: string
  permissions?: string[]
  updatedBy?: string
}
