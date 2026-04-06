export interface TaskTimeEntryRetrieveAllRequest {
  pageNumber?: number
  pageSize?: number
  taskId?: string
  userId?: string
  dateFrom?: Date
  dateTo?: Date
  isBillable?: boolean
}

export interface TaskTimeEntryRetrieveAllResponse {
  data: any[]
  count: number
  pageNumber: number
  pageSize: number
}
