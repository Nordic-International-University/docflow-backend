export interface SessionRetrieveAllRequest {
  pageNumber?: number
  pageSize?: number
}

export interface SessionItem {
  id: string
  ipAddress: string | null
  userAgent: string | null
  browser: string
  os: string
  device: string
  isCurrent: boolean
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
