/**
 * Document Labels Utility — Uzbek localization tests.
 */

jest.mock('@common', () => ({
  translateActionTypeToUzbek: (type: string) => {
    const map: Record<string, string> = {
      APPROVAL: 'Tasdiqlash',
      SIGN: 'Imzolash',
      REVIEW: "Ko'rib chiqish",
      ACKNOWLEDGE: 'Tanishish',
      VERIFICATION: 'Tekshirish',
    }
    return map[type] || type
  },
}))

import {
  getWorkflowStepActionTitle,
  getAuditActionTitle,
} from '../../src/common/utils/document-labels.util'

describe('Document Labels', () => {
  describe('getWorkflowStepActionTitle', () => {
    it('APPROVED action', () => {
      const title = getWorkflowStepActionTitle('APPROVED', 2, 'APPROVAL')
      expect(title).toContain('2-bosqich')
      expect(title).toContain('tasdiqlandi')
    })

    it('REJECTED action', () => {
      const title = getWorkflowStepActionTitle('REJECTED', 1, 'REVIEW')
      expect(title).toContain('1-bosqich')
      expect(title).toContain('rad etildi')
    })

    it('STARTED action', () => {
      const title = getWorkflowStepActionTitle('STARTED', 3, 'SIGN')
      expect(title).toContain('3-bosqich')
      expect(title).toContain('boshlandi')
    })

    it('unknown action — fallback', () => {
      const title = getWorkflowStepActionTitle('CUSTOM', 1, 'APPROVAL')
      expect(title).toContain('1-bosqich')
      expect(title).toContain('CUSTOM')
    })
  })

  describe('getAuditActionTitle', () => {
    it('CREATE', () => {
      expect(getAuditActionTitle('CREATE')).toBe('Hujjat yaratildi')
    })

    it('UPDATE', () => {
      expect(getAuditActionTitle('UPDATE')).toContain('yangilandi')
    })

    it('DELETE', () => {
      expect(getAuditActionTitle('DELETE')).toContain("o'chirildi")
    })

    it('APPROVE', () => {
      expect(getAuditActionTitle('APPROVE')).toContain('tasdiqlandi')
    })

    it('REJECT', () => {
      expect(getAuditActionTitle('REJECT')).toContain('rad etildi')
    })

    it('ARCHIVE', () => {
      expect(getAuditActionTitle('ARCHIVE')).toContain('arxivlandi')
    })

    it('unknown — returns as-is', () => {
      expect(getAuditActionTitle('CUSTOM_ACTION')).toBe('CUSTOM_ACTION')
    })
  })
})
