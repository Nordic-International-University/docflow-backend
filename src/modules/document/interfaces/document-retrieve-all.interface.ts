import { DocumentStatus as LocalDocumentStatus } from './document-enums'
import { DocumentStatus } from '@prisma/client'

export interface DocumentRetrieveOneRequest {
  id: string
  userId?: string
  roleName?: string
}

export interface DocumentRetrieveOneResponse {
  id: string
  title: string
  description: string | null
  documentNumber: string | null
  status: string
  documentType: {
    id: string
    name: string
  }
  journal: {
    id: string
    name: string
  }
  createdBy: {
    id: string
    fullname: string
  }
  updatedBy: {
    id: string
    fullname: string
  } | null
  attachments: {
    id: string
    fileName: string
    fileUrl: string
  }[]
}

export interface DocumentRetrieveAllRequest {
  pageNumber?: number
  pageSize?: number
  search?: string
  status?: DocumentStatus
  documentTypeId?: string
  journalId?: string
  templateId?: string
  userId?: string
  roleName?: string
}

export interface DocumentList {
  id: string
  title: string
  documentNumber: string | null
  status: string
  documentType: {
    id: string
    name: string
  }
  createdBy: {
    id: string
    fullname: string
  }
}

export interface DocumentRetrieveAllResponse {
  count: number
  pageNumber: number
  pageSize: number
  pageCount: number
  data: DocumentList[]
}
