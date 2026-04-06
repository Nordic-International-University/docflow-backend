export interface TaskActivityRetrieveOneRequest {
  id: string
}

export interface TaskActivityRetrieveOneResponse {
  id: string
  taskId: string
  userId: string
  action: string
  changes?: any
  metadata?: any
  user: {
    id: string
    fullname: string
    email: string
  }
  createdAt: Date
}
