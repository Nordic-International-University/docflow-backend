export interface JournalCreateRequest {
  name: string
  prefix: string
  format: string
  departmentId?: string
  responsibleUserId?: string
  createdBy?: string
}
