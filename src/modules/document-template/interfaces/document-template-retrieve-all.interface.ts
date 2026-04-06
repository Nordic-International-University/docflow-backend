export interface DocumentTemplateRetrieveAllRequest {
  pageNumber?: number
  pageSize?: number
  search?: string
  documentTypeId?: string
  isActive?: boolean
  isPublic?: boolean
}

export interface DocumentTemplateRetrieveAllResponse {
  data: Array<{
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
      fileSize: string
      fileUrl: string
      mimeType: string
    }
  }>
  count: number
  pageNumber: number
  pageSize: number
  pageCount: number
}
