export interface TaskLabelRetrieveOneRequest {
  id: string
}

export interface TaskLabelRetrieveOneResponse {
  id: string
  taskId: string
  labelId: string
  label: {
    id: string
    name: string
    color?: string
  }
  createdAt: Date
}
