export interface JournalUpdateRequest {
  id: string
  name?: string
  prefix?: string
  format?: string
  departmentId?: string | null
  responsibleUserId?: string | null
  updatedBy?: string
}
