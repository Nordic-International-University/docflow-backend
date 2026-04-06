/**
 * Translate StepActionType from English to Uzbek
 * @param actionType The action type in English (e.g., "APPROVAL", "SIGN")
 * @returns Translated action type in Uzbek
 */
export function translateActionTypeToUzbek(actionType: string): string {
  const translations: Record<string, string> = {
    APPROVAL: 'Tasdiqlash',
    SIGN: 'Imzolash',
    REVIEW: "Ko'rib chiqish",
    ACKNOWLEDGE: 'Tanishish',
    VERIFICATION: 'Tekshirish',
  }
  return translations[actionType] || actionType
}

/**
 * Action type translations mapping
 */
export const ACTION_TYPE_TRANSLATIONS_UZ: Record<string, string> = {
  APPROVAL: 'Tasdiqlash',
  SIGN: 'Imzolash',
  REVIEW: "Ko'rib chiqish",
  ACKNOWLEDGE: 'Tanishish',
  VERIFICATION: 'Tekshirish',
}

/**
 * Uzbek month names
 */
const UZBEK_MONTHS = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentabr',
  'oktabr',
  'noyabr',
  'dekabr',
]

/**
 * Format date to Uzbek human-readable format
 * @param date The date to format
 * @returns Formatted date string in Uzbek (e.g., "15-yanvar 2024, soat 14:30")
 */
export function formatDateToUzbek(
  date: Date | string | null | undefined,
): string {
  if (!date) {
    return 'Muddatsiz'
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return "Noto'g'ri sana"
  }

  const day = dateObj.getDate()
  const month = UZBEK_MONTHS[dateObj.getMonth()]
  const year = dateObj.getFullYear()
  const hours = String(dateObj.getHours()).padStart(2, '0')
  const minutes = String(dateObj.getMinutes()).padStart(2, '0')

  return `${day}-${month} ${year}, soat ${hours}:${minutes}`
}
