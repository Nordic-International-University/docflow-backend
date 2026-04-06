export interface DepartmentCreateRequest {
  name: string
  description: string
  directorId?: string
  parentId?: string
  code?: string
  location?: string
  createdBy?: string
}
