/**
 * Audit log helper — 66 joyda takrorlangan audit chaqiruvlarni qisqartirish.
 *
 * Oldin:
 *   await this.#_auditLogService.logAction(
 *     'Document',
 *     document.id,
 *     AuditAction.CREATE,
 *     payload.userId,
 *     { newValues: { title, status } },
 *     payload.ipAddress,
 *   )
 *
 * Keyin:
 *   await auditLog(this.#_auditLogService, {
 *     entity: 'Document',
 *     entityId: document.id,
 *     action: AuditAction.CREATE,
 *     userId: payload.userId,
 *     changes: { title, status },
 *   })
 *
 * Bu function qisqartirish uchun — tashqi API o'zgarmaydi.
 */

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

/**
 * Audit log yozish — auditLogService.logAction() ni wrap qiladi.
 * Service'da to'g'ridan-to'g'ri chaqirish mumkin:
 *
 *   await auditLog(this.auditLogService, { ... })
 *
 * Agar auditLogService null/undefined bo'lsa — skip (xavfsiz).
 */
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
  } catch {
    // Audit log xatosi asosiy operatsiyani to'xtatmasligi kerak
  }
}
