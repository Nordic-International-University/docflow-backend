export interface TaskAttachmentRetrieveOneRequest {
  id: string
}

export interface TaskAttachmentRetrieveOneResponse {
  id: string
  taskId: string
  attachmentId: string
  uploadedById: string
  description?: string
  attachment: {
    id: string
    fileName: string
    fileSize: number
    mimeType: string
    url?: string
  }
  uploadedBy: {
    id: string
    fullname: string
  }
  createdAt: Date
  updatedAt: Date
}
