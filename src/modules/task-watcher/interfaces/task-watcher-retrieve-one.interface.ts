export interface TaskWatcherRetrieveOneRequest {
  id: string
}

export interface TaskWatcherRetrieveOneResponse {
  id: string
  taskId: string
  userId: string
  user: {
    id: string
    fullname: string
    email: string
  }
  createdAt: Date
}
