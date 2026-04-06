export interface TaskCategoryCreateRequest {
  name: string
  description?: string
  color?: string
  isActive?: boolean
  createdBy?: string
}
