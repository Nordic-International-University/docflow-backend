export interface ProjectLabelRetrieveOneRequest {
  id: string
}

export interface ProjectLabelRetrieveOneResponse {
  id: string
  projectId: string
  name: string
  color: string
  description?: string
  taskCount?: number
  createdAt: Date
  updatedAt: Date
}
