export interface TaskCategoryUpdateRequest {
  id: string
  name?: string
  description?: string
  color?: string
  isActive?: boolean
  updatedBy?: string
}
