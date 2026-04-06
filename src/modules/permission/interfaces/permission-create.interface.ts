export interface PermissionCreateRequest {
  name: string
  key: string
  module: string
  description: string
  createdBy?: string
}
