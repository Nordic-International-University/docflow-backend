/**
 * Workflow step / audit action title helpers — Uzbek labels.
 *
 * document.service.ts ichida 2 ta private method edi, lekin
 * ular pure mapping bo'lgani uchun utility sifatida chiqarildi.
 */

import { translateActionTypeToUzbek } from '@common'

export function getWorkflowStepActionTitle(
  actionType: string,
  stepOrder: number,
  stepActionType: string,
): string {
  const stepActionUz = translateActionTypeToUzbek(stepActionType)
  const map: Record<string, string> = {
    STARTED: `${stepOrder}-bosqich boshlandi: ${stepActionUz}`,
    APPROVED: `${stepOrder}-bosqich tasdiqlandi: ${stepActionUz}`,
    REJECTED: `${stepOrder}-bosqich rad etildi: ${stepActionUz}`,
    REASSIGNED: `${stepOrder}-bosqich qayta tayinlandi`,
    COMMENTED: `${stepOrder}-bosqichga izoh qoldirildi`,
    DELEGATED: `${stepOrder}-bosqich boshqaga uzatildi`,
  }
  return map[actionType] || `${stepOrder}-bosqich: ${actionType}`
}

export function getAuditActionTitle(action: string): string {
  const map: Record<string, string> = {
    CREATE: 'Hujjat yaratildi',
    UPDATE: "Hujjat ma'lumotlari yangilandi",
    DELETE: "Hujjat o'chirildi",
    RESTORE: 'Hujjat qayta tiklandi',
    APPROVE: 'Hujjat tasdiqlandi',
    REJECT: 'Hujjat rad etildi',
    ARCHIVE: 'Hujjat arxivlandi',
    OTHER: 'Boshqa amal',
  }
  return map[action] || action
}
