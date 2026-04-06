export interface DocumentTemplateCreateRequest {
  name: string
  description?: string
  documentTypeId: string
  templateFileId: string
  requiredTags?: Record<string, any>
  isActive?: boolean
  isPublic?: boolean
  createdBy?: string
}
