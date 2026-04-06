export interface DepartmentRetrieveOneRequest {
  id: string
}

export interface DepartmentRetrieveOneResponse {
  id: string
  name: string
  description: string
  headId?: string
}
