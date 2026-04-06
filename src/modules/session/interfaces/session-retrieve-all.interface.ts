export interface SessionRetrieveAllRequest {
  pageNumber?: number
  pageSize?: number
}

export interface SessionItem {
  id: string
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
  expiresAt: Date
}

export interface SessionRetrieveAllResponse {
  count: number
  pageNumber: number
  pageSize: number
  pageCount: number
  data: SessionItem[]
}
