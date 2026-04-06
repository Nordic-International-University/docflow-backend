export interface TaskChecklistRetrieveOneRequest {
  id: string
}

export interface TaskChecklistRetrieveOneResponse {
  id: string
  taskId: string
  title: string
  position: number
  items: TaskChecklistItemResponse[]
  createdAt: Date
  updatedAt: Date
}

export interface TaskChecklistItemRetrieveOneRequest {
  id: string
}

export interface TaskChecklistItemResponse {
  id: string
  checklistId: string
  title: string
  isCompleted: boolean
  completedById?: string
  completedAt?: Date
  position: number
  completedBy?: {
    id: string
    fullname: string
  }
  createdAt: Date
  updatedAt: Date
}
