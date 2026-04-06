export interface AttachmentUpdateRequest {
  id: string
  fileName?: string
  fileUrl?: string
  fileSize?: number
  mimeType?: string
  documentId?: string
  uploadedById?: string
}
