export interface TaskChecklistCreateRequest {
  taskId: string
  title: string
  position?: number
  createdBy?: string
}

export interface TaskChecklistItemCreateRequest {
  checklistId: string
  title: string
  position?: number
  createdBy?: string
}
