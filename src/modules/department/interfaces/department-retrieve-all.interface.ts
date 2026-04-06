import { DepartmentRetrieveOneResponse } from './department-retrieve-one.interface'

export interface DepartmentRetrieveAllRequest {
  pageNumber?: number
  pageSize?: number
  search?: string
}

export interface DepartmentRetrieveAllResponse {
  count: number
  pageNumber: number
  pageSize: number
  data: DepartmentRetrieveOneResponse[]
}
