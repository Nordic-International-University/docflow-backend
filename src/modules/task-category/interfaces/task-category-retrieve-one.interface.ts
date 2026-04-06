export interface TaskCategoryRetrieveOneRequest {
  id: string
}

export interface TaskCategoryRetrieveOneResponse {
  id: string
  name: string
  description?: string
  color?: string
  isActive: boolean
  taskCount?: number
  createdAt: Date
  updatedAt: Date
}
