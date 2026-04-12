import { AuditAction } from './audit-log-enums'

export interface AuditLogCreateRequest {
  entity: string
  entityId: string
  action: AuditAction
  changes?: Record<string, unknown>
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  performedByUserId: string
}

export interface AuditLogCreateResponse {
  id: string
  entity: string
  entityId: string
  action: string
  performedByUserId: string
  performedAt: Date
}
