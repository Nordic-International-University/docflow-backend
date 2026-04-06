import { AuditAction } from './audit-log-enums'

export interface AuditLogRetrieveAllRequest {
  pageNumber?: number
  pageSize?: number
  search?: string
  entity?: string
  entityId?: string
  action?: AuditAction
  performedByUserId?: string
  startDate?: Date
  endDate?: Date
}

export interface AuditLogList {
  id: string
  entity: string
  entityId: string
  action: string
  performedByUserId: string
  performedBy: {
    id: string
    fullname: string
    username: string
  }
  performedAt: Date
  ipAddress: string | null
  changes: any
}

export interface AuditLogRetrieveAllResponse {
  count: number
  pageNumber: number
  pageSize: number
  pageCount: number
  data: AuditLogList[]
}

export interface AuditLogRetrieveOneRequest {
  id: string
}

export interface AuditLogRetrieveOneResponse {
  id: string
  entity: string
  entityId: string
  action: string
  changes: any
  oldValues: any
  newValues: any
  ipAddress: string | null
  userAgent: string | null
  performedByUserId: string
  performedBy: {
    id: string
    fullname: string
    username: string
  }
  performedAt: Date
  createdAt: Date
}
