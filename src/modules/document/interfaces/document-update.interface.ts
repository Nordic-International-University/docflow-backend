import { DocumentStatus } from './document-enums'

export interface DocumentUpdateRequest {
  id: string
  title?: string
  description?: string | null
  documentNumber?: string | null
  status?: DocumentStatus
  documentTypeId?: string
  journalId?: string
  userId?: string
  roleName?: string
}
