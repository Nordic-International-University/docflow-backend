export interface RoleCreateRequest {
  name: string
  description: string
  permissions: string[]
  createdBy?: string
}
