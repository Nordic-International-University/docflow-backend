export interface DocumentTemplate {
  id: string
  name: string
  description?: string | null
  isActive: boolean
  documentType: {
    id: string
    name: string
  }
  templateFile: {
    id: string
    fileName: string
    fileSize: string
    fileUrl: string
    mimeType: string
  }
}
