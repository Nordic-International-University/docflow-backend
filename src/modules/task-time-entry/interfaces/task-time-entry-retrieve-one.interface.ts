export interface TaskTimeEntryRetrieveOneRequest {
  id: string
}

export interface TaskTimeEntryRetrieveOneResponse {
  id: string
  taskId: string
  userId: string
  description?: string
  hours: number
  date: Date
  isBillable: boolean
  user: {
    id: string
    fullname: string
  }
  task: {
    id: string
    title: string
  }
  createdAt: Date
  updatedAt: Date
}
