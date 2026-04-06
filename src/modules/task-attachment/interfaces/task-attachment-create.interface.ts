export interface TaskAttachmentCreateRequest {
  taskId: string
  attachmentId: string
  description?: string
  uploadedById?: string
}
