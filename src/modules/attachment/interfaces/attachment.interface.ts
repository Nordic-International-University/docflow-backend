// attachment.interface.ts
export interface Attachment {
  id: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  documentId?: string
  uploadedById?: string
  uploadedBy?: {
    id: string
    fullname: string
    username: string
  }
  document?: {
    id: string
    title: string
  }
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}
