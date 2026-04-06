export interface JournalRetrieveAllRequest {
  pageNumber?: number
  pageSize?: number
  search?: string
}

export interface JournalList {
  id: string
  name: string
  prefix: string
  format: string
  department?: {
    id: string
    name: string
  }
  responsibleUser?: {
    id: string
    fullname: string
    username: string
  }
  documentsCount: number
}

export interface JournalRetrieveAllResponse {
  count: number
  pageNumber: number
  pageSize: number
  pageCount: number
  data: JournalList[]
}
