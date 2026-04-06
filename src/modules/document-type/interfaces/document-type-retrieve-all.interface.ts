import { DocumentTypeRetrieveOneResponse } from './document-type-retrieve-one.interface'

export interface DocumentTypeRetrieveAllRequest {
  pageNumber?: number
  pageSize?: number
  search?: string
  isActive?: boolean
}

export interface DocumentTypeRetrieveAllResponse {
  count: number
  pageNumber: number
  pageSize: number
  data: DocumentTypeRetrieveOneResponse[]
}
