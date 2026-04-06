import { RoleCreateRequest } from '../interfaces'

export class RoleCreateDto implements RoleCreateRequest {
  description: string
  name: string
  permissions: string[]
}
