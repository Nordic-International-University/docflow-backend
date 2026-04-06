// attachment-retrieve-all.interface.ts
export interface AttachmentRetrieveAllRequest {
  pageNumber?: number
  pageSize?: number
  search?: string
  documentId?: string
  uploadedById?: string
}

export interface AttachmentList {
  id: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
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
}

export interface AttachmentRetrieveAllResponse {
  count: number
  pageNumber: number
  pageSize: number
  pageCount: number
  data: AttachmentList[]
}
