export interface AttachmentCreateRequest {
  file: Express.Multer.File
  uploadedById: string
}

export interface AttachmentCreateResponse {
  id: string
  fileName: string
  fileSize: number
  fileUrl: string
  mimeType: string
}
