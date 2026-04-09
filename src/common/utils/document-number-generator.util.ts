import { PrismaService } from '@prisma'

export interface DocumentNumberFormat {
  prefix: string
  format: string
  journalId?: string
}

export class DocumentNumberGenerator {
  /**
   * Generate a unique document number based on journal format
   * Supports placeholders (case-insensitive):
   * - {prefix}: Journal prefix
   * - {year}: 4-digit year
   * - {yy}: 2-digit year
   * - {month}: 2-digit month
   * - {day}: 2-digit day
   * - {date}: Full date YYYYMMDD
   * - {sequence}: Auto-incrementing (4 digits)
   * - {seq}: Auto-incrementing (3 digits)
   * - {NUMBER:N}: Auto-incrementing (N digits)
   * - {NUMBER}: Auto-incrementing (4 digits)
   */
  static async generate(
    prisma: PrismaService,
    journalId: string,
    customDate?: Date,
  ): Promise<string> {
    const journal = await prisma.journal.findFirst({
      where: { id: journalId, deletedAt: null },
    })

    if (!journal) {
      throw new Error('Journal not found')
    }

    return this.generateFromFormat(
      prisma,
      { prefix: journal.prefix, format: journal.format, journalId },
      customDate,
    )
  }

  static async generateFromFormat(
    prisma: PrismaService,
    config: DocumentNumberFormat,
    customDate?: Date,
  ): Promise<string> {
    const date = customDate || new Date()

    const hasSequence = this.hasSequencePlaceholder(config.format)

    if (!hasSequence) {
      const result = this.buildNumber(config, date, 0)
      const existing = await prisma.document.findFirst({
        where: { documentNumber: result, deletedAt: null },
      })
      if (existing) {
        throw new Error(
          `Document number "${result}" already exists. Add {NUMBER:N} placeholder to your journal format.`,
        )
      }
      return result
    }

    const prefix = this.buildPrefix(config, date)
    const key = `${config.journalId || 'global'}:${prefix}`

    const MAX_RETRIES = 10

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      // Atomic increment va qiymatni olish
      const rows: Array<{ counter: number }> = await prisma.$queryRawUnsafe(
        `INSERT INTO document_sequence (key, counter, updated_at)
         VALUES ($1, 1, NOW())
         ON CONFLICT (key)
         DO UPDATE SET counter = document_sequence.counter + 1, updated_at = NOW()
         RETURNING counter`,
        key,
      )

      let nextSeq = rows[0]?.counter || 1
      if (nextSeq === 1) {
        const existingMax = await this.findMaxExistingSequence(
          prisma,
          config,
          date,
        )
        if (existingMax >= 1) {
          const updated: Array<{ counter: number }> =
            await prisma.$queryRawUnsafe(
              `UPDATE document_sequence
             SET counter = GREATEST(counter, $2) + 1, updated_at = NOW()
             WHERE key = $1
             RETURNING counter`,
              key,
              existingMax,
            )
          nextSeq = updated[0]?.counter || existingMax + 1
        }
      }

      const candidate = this.buildNumber(config, date, nextSeq)

      // Yakuniy tekshirish — bu raqam aynan mavjud emasmi
      // (manual insert bilan conflict ehtimoli)
      const existing = await prisma.document.findFirst({
        where: { documentNumber: candidate, deletedAt: null },
        select: { id: true },
      })

      if (!existing) {
        return candidate
      }

      // Conflict — counter'ni ko'tarib qayta urinish
      await prisma.$queryRawUnsafe(
        `UPDATE document_sequence
         SET counter = counter + 1, updated_at = NOW()
         WHERE key = $1`,
        key,
      )
    }

    throw new Error(
      "Hujjat raqami generatsiya qilib bo'lmadi. Iltimos qayta urining.",
    )
  }

  /** Mavjud hujjatlardan eng katta sequence raqamini topish */
  private static async findMaxExistingSequence(
    prisma: PrismaService,
    config: DocumentNumberFormat,
    date: Date,
  ): Promise<number> {
    const prefix = this.buildPrefix(config, date)

    const whereClause: any = {
      documentNumber: { startsWith: prefix },
      deletedAt: null,
    }
    if (config.journalId) {
      whereClause.journalId = config.journalId
    }

    const existingDocs = await prisma.document.findMany({
      where: whereClause,
      select: { documentNumber: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })

    if (existingDocs.length === 0) return 0

    let max = 0
    for (const doc of existingDocs) {
      if (!doc.documentNumber) continue
      const suffix = doc.documentNumber.substring(prefix.length)
      const num = parseInt(suffix, 10)
      if (!isNaN(num) && num > max) max = num
    }
    return max
  }

  private static hasSequencePlaceholder(format: string): boolean {
    const lower = format.toLowerCase()
    return (
      lower.includes('{sequence}') ||
      lower.includes('{seq}') ||
      lower.includes('{number}') ||
      /{number:\d+}/i.test(format)
    )
  }

  /**
   * Build the document number by replacing all placeholders
   */
  private static buildNumber(
    config: DocumentNumberFormat,
    date: Date,
    sequence: number,
  ): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const yy = String(year).slice(-2)
    const dateStr = `${year}${month}${day}`

    let result = config.format
    // Replace date/prefix placeholders (case-insensitive)
    result = result.replace(/{prefix}/gi, config.prefix)
    result = result.replace(/{year}/gi, String(year))
    result = result.replace(/{yy}/gi, yy)
    result = result.replace(/{month}/gi, month)
    result = result.replace(/{day}/gi, day)
    result = result.replace(/{date}/gi, dateStr)

    // Replace sequence placeholders
    result = result.replace(/{sequence}/gi, String(sequence).padStart(4, '0'))
    result = result.replace(/{seq}/gi, String(sequence).padStart(3, '0'))

    // {NUMBER:N} — N digit padding
    result = result.replace(/{NUMBER:(\d+)}/gi, (_, digits) =>
      String(sequence).padStart(parseInt(digits, 10), '0'),
    )
    // {NUMBER} without padding spec — default 4
    result = result.replace(/{NUMBER}/gi, String(sequence).padStart(4, '0'))

    return result
  }

  /**
   * Get the prefix part of the document number (everything before the sequence)
   */
  private static buildPrefix(config: DocumentNumberFormat, date: Date): string {
    const format = config.format.toLowerCase()
    let prefixPart = config.format

    // Split at the sequence placeholder
    if (format.includes('{sequence}')) {
      prefixPart = config.format.substring(0, format.indexOf('{sequence}'))
    } else if (format.includes('{seq}')) {
      prefixPart = config.format.substring(0, format.indexOf('{seq}'))
    } else {
      // {NUMBER:N} or {NUMBER}
      const match = config.format.match(/{number(:\d+)?}/i)
      if (match) {
        prefixPart = config.format.substring(0, config.format.indexOf(match[0]))
      }
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const yy = String(year).slice(-2)
    const dateStr = `${year}${month}${day}`

    return prefixPart
      .replace(/{prefix}/gi, config.prefix)
      .replace(/{year}/gi, String(year))
      .replace(/{yy}/gi, yy)
      .replace(/{month}/gi, month)
      .replace(/{day}/gi, day)
      .replace(/{date}/gi, dateStr)
  }

  private static async getNextSequence(
    prisma: PrismaService,
    config: DocumentNumberFormat,
    date: Date,
  ): Promise<number> {
    const prefix = this.buildPrefix(config, date)

    const whereClause: any = {
      documentNumber: { startsWith: prefix },
    }
    if (config.journalId) {
      whereClause.journalId = config.journalId
    }

    const existingDocs = await prisma.document.findMany({
      where: whereClause,
      select: { documentNumber: true },
      orderBy: { documentNumber: 'desc' },
    })

    if (existingDocs.length === 0) return 1

    // Extract sequence numbers: take everything after the prefix and parse as int
    const sequences: number[] = []
    for (const doc of existingDocs) {
      if (!doc.documentNumber) continue
      const suffix = doc.documentNumber.substring(prefix.length)
      const num = parseInt(suffix, 10)
      if (!isNaN(num) && num > 0) {
        sequences.push(num)
      }
    }

    if (sequences.length === 0) return 1
    return Math.max(...sequences) + 1
  }

  static validateFormat(format: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!format || format.trim() === '') {
      errors.push('Format cannot be empty')
      return { valid: false, errors }
    }

    const hasPlaceholder =
      /{prefix}|{year}|{yy}|{month}|{day}|{date}|{sequence}|{seq}|{number}/i.test(
        format,
      )
    if (!hasPlaceholder) {
      errors.push('Format must contain at least one placeholder')
    }

    const hasSequence = this.hasSequencePlaceholder(format)
    if (!hasSequence) {
      errors.push(
        'Warning: No sequence placeholder. Documents may not be unique.',
      )
    }

    return {
      valid: errors.filter((e) => !e.startsWith('Warning:')).length === 0,
      errors,
    }
  }
}
