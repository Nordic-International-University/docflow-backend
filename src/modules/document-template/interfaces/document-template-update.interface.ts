export interface DocumentTemplateUpdateRequest {
  id: string
  name?: string
  description?: string
  templateFileId?: string
  documentTypeId?: string
  isActive?: boolean
  isPublic?: boolean
  updatedBy?: string
}
