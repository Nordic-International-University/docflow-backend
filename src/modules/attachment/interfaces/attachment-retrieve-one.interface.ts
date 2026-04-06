export interface AttachmentRetrieveOneRequest {
  id: string
}

export interface AttachmentRetrieveOneResponse {
  id: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  documentId?: string
  uploadedById?: string
  document?: {
    id: string
    title: string
  }
  uploadedBy?: {
    id: string
    fullname: string
    username: string
  }
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}
