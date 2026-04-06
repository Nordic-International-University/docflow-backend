import { PermissionList } from './role-retrieve-all.interface'

export interface RoleRetrieveOneRequest {
  id: string
}

export interface RoleRetrieveOneResponse {
  id: string
  name: string
  description: string
  permissions: PermissionList[]
}
