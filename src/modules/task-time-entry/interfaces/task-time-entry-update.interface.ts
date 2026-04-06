export interface TaskTimeEntryUpdateRequest {
  id: string
  description?: string
  hours?: number
  date?: Date
  isBillable?: boolean
  updatedBy?: string
}
