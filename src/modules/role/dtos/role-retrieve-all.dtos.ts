import { RoleRetrieveAllRequest } from '../interfaces'

export class RoleRetrieveAllDtos implements RoleRetrieveAllRequest {
  pageSize: number
  pageNumber: number
  search: string
}
