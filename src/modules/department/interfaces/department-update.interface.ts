export interface DepartmentUpdateRequest {
  id: string
  name?: string
  description?: string
  directorId?: string
  parentId?: string
  code?: string
  location?: string
  updatedBy?: string
}
