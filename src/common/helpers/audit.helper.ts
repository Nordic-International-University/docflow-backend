import { Logger } from '@nestjs/common'

const auditLogger = new Logger('AuditHelper')

export interface AuditLogParams {
  entity: string
  entityId: string
  action: string
  userId: string
  changes?: Record<string, any>
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  ipAddress?: string
}

export async function auditLog(
  service: { logAction: (...args: any[]) => Promise<any> } | null | undefined,
  params: AuditLogParams,
): Promise<void> {
  if (!service) return

  try {
    await service.logAction(
      params.entity,
      params.entityId,
      params.action,
      params.userId,
      {
        ...(params.changes && { newValues: params.changes }),
        ...(params.oldValues && { oldValues: params.oldValues }),
        ...(params.newValues && { newValues: params.newValues }),
      },
      params.ipAddress,
    )
  } catch (err: any) {
    auditLogger.warn(
      `[audit-log] write FAILED (entity=${params.entity}, id=${params.entityId}, ` +
        `action=${params.action}, user=${params.userId}): ${err?.message ?? err}`,
      err?.stack,
    )
  }
}
