export interface TaskTimeEntryCreateRequest {
  taskId: string
  userId: string
  description?: string
  hours: number
  date: Date
  isBillable?: boolean
  createdBy?: string
}
