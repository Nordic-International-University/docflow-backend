export interface TaskChecklistUpdateRequest {
  id: string
  title?: string
  position?: number
  updatedBy?: string
}

export interface TaskChecklistItemUpdateRequest {
  id: string
  title?: string
  isCompleted?: boolean
  position?: number
  updatedBy?: string
}
