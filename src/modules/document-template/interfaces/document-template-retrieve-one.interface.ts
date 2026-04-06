export interface DocumentTemplateRetrieveOneRequest {
  id: string
}

export interface DocumentTemplateRetrieveOneResponse {
  id: string
  name: string
  description: string
  isActive: boolean
  isPublic: boolean
  documentType: {
    id: string
    name: string
  }
  templateFile: {
    id: string
    fileName: string
    fileSize: number
    fileUrl: string
    mimeType: string
  }
}
