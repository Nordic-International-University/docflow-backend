export interface JournalRetrieveOneRequest {
  id: string
}

export interface JournalRetrieveOneResponse {
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
