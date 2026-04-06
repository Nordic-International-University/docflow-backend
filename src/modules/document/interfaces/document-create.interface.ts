import { DocumentStatus } from './document-enums'

export interface DocumentCreateRequest {
  userId: string
  title: string
  description?: string | null
  documentNumber?: string | null
  status?: DocumentStatus
  attachments: string[]
  documentTypeId: string
  journalId: string
  templateId?: string | null
  tags?: Record<string, any>
}
