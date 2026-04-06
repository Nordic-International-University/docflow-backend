import { PrismaService } from '@prisma'

export interface DocumentNumberFormat {
  prefix: string
  format: string
  journalId?: string
}

export class DocumentNumberGenerator {
  /**
   * Generate a unique document number based on journal format
   * Supports the following placeholders:
   * - {prefix}: Journal prefix
   * - {year}: 4-digit year (e.g., 2024)
   * - {yy}: 2-digit year (e.g., 24)
   * - {month}: 2-digit month (01-12)
   * - {day}: 2-digit day (01-31)
   * - {date}: Full date YYYYMMDD
   * - {sequence}: Auto-incrementing sequence number (padded to 4 digits)
   * - {seq}: Auto-incrementing sequence number (padded to 3 digits)
   *
   * Examples:
   * - "{prefix}-{year}-{sequence}" -> "INV-2024-0001"
   * - "{prefix}/{yy}/{month}/{seq}" -> "DOC/24/12/001"
   * - "{prefix}-{date}-{sequence}" -> "RPT-20241216-0001"
   *
   * @param prisma PrismaService instance
   * @param journalId Journal ID to get prefix and format
   * @param customDate Optional custom date (defaults to current date)
   * @returns Generated unique document number
   */
  static async generate(
    prisma: PrismaService,
    journalId: string,
    customDate?: Date,
  ): Promise<string> {
    const journal = await prisma.journal.findFirst({
      where: {
        id: journalId,
        deletedAt: null,
      },
    })

    if (!journal) {
      throw new Error('Journal not found')
    }

    return this.generateFromFormat(
      prisma,
      {
        prefix: journal.prefix,
        format: journal.format,
        journalId: journalId,
      },
      customDate,
    )
  }

  /**
   * Generate document number from a specific format configuration
   */
  static async generateFromFormat(
    prisma: PrismaService,
    config: DocumentNumberFormat,
    customDate?: Date,
  ): Promise<string> {
    const date = customDate || new Date()
    const hasSequence =
      config.format.includes('{sequence}') || config.format.includes('{seq}')

    // Generate base number without sequence first
    let baseNumber = this.replacePlaceholders(config, date, 0)

    if (!hasSequence) {
      // If no sequence placeholder, check if it's unique
      const existing = await prisma.document.findFirst({
        where: {
          documentNumber: baseNumber,
          deletedAt: null,
        },
      })

      if (existing) {
        throw new Error(
          `Document number "${baseNumber}" already exists. Consider adding {sequence} placeholder to your journal format.`,
        )
      }

      return baseNumber
    }

    // Find the next available sequence number
    const sequenceNumber = await this.getNextSequenceNumber(
      prisma,
      config,
      date,
    )

    // Generate final number with sequence
    return this.replacePlaceholders(config, date, sequenceNumber)
  }

  /**
   * Replace all placeholders in the format string
   */
  private static replacePlaceholders(
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
      .replace(/{prefix}/g, config.prefix)
      .replace(/{year}/g, String(year))
      .replace(/{yy}/g, yy)
      .replace(/{month}/g, month)
      .replace(/{day}/g, day)
      .replace(/{date}/g, dateStr)

    // Handle sequence placeholders
    if (result.includes('{sequence}')) {
      result = result.replace(/{sequence}/g, String(sequence).padStart(4, '0'))
    }
    if (result.includes('{seq}')) {
      result = result.replace(/{seq}/g, String(sequence).padStart(3, '0'))
    }

    return result
  }

  /**
   * Find the next available sequence number for a given format and date
   * This method looks at existing document numbers matching the pattern
   * and returns the next available sequence
   */
  private static async getNextSequenceNumber(
    prisma: PrismaService,
    config: DocumentNumberFormat,
    date: Date,
  ): Promise<number> {
    // Extract the prefix part BEFORE replacing placeholders
    // Split by {sequence} or {seq} to get everything before the sequence
    let prefixFormat = config.format
    if (config.format.includes('{sequence}')) {
      prefixFormat = config.format.split('{sequence}')[0]
    } else if (config.format.includes('{seq}')) {
      prefixFormat = config.format.split('{seq}')[0]
    }

    // Now replace date placeholders in the prefix part only
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const yy = String(year).slice(-2)
    const dateStr = `${year}${month}${day}`

    const prefixBeforeSequence = prefixFormat
      .replace(/{prefix}/g, config.prefix)
      .replace(/{year}/g, String(year))
      .replace(/{yy}/g, yy)
      .replace(/{month}/g, month)
      .replace(/{day}/g, day)
      .replace(/{date}/g, dateStr)

    // Get all documents from this journal that start with the prefix
    const whereClause: any = {
      documentNumber: {
        startsWith: prefixBeforeSequence,
      },
    }

    // Filter by journalId if provided
    if (config.journalId) {
      whereClause.journalId = config.journalId
    }

    const existingDocuments = await prisma.document.findMany({
      where: whereClause,
      select: {
        documentNumber: true,
      },
      orderBy: {
        documentNumber: 'desc',
      },
    })

    if (existingDocuments.length === 0) {
      return 1
    }

    // Extract sequence numbers from existing documents
    const sequences: number[] = []

    for (const doc of existingDocuments) {
      if (!doc.documentNumber) continue

      const sequence = this.extractSequenceNumber(
        doc.documentNumber,
        config,
        date,
      )
      if (sequence !== null) {
        sequences.push(sequence)
      }
    }

    if (sequences.length === 0) {
      return 1
    }

    // Return the highest sequence + 1
    return Math.max(...sequences) + 1
  }

  /**
   * Extract sequence number from a document number
   * given the format configuration
   */
  private static extractSequenceNumber(
    documentNumber: string,
    config: DocumentNumberFormat,
    date: Date,
  ): number | null {
    // Create a regex pattern from the format
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const yy = String(year).slice(-2)
    const dateStr = `${year}${month}${day}`

    // Escape special regex characters in the format
    let pattern = config.format
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(
        /\\{prefix\\}/g,
        config.prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      )
      .replace(/\\{year\\}/g, String(year))
      .replace(/\\{yy\\}/g, yy)
      .replace(/\\{month\\}/g, month)
      .replace(/\\{day\\}/g, day)
      .replace(/\\{date\\}/g, dateStr)

    // Replace sequence placeholders with capturing groups
    if (pattern.includes('\\{sequence\\}')) {
      pattern = pattern.replace(/\\{sequence\\}/g, '(\\d+)')
    } else if (pattern.includes('\\{seq\\}')) {
      pattern = pattern.replace(/\\{seq\\}/g, '(\\d+)')
    } else {
      return null
    }

    const regex = new RegExp(`^${pattern}$`)
    const match = documentNumber.match(regex)

    if (!match || !match[1]) {
      return null
    }

    return parseInt(match[1], 10)
  }

  /**
   * Validate a journal format string
   * Returns validation result with any errors
   */
  static validateFormat(format: string): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (!format || format.trim() === '') {
      errors.push('Format cannot be empty')
      return { valid: false, errors }
    }

    // Check for at least one placeholder
    const hasPlaceholder =
      /{prefix}|{year}|{yy}|{month}|{day}|{date}|{sequence}|{seq}/.test(format)

    if (!hasPlaceholder) {
      errors.push(
        'Format must contain at least one placeholder: {prefix}, {year}, {yy}, {month}, {day}, {date}, {sequence}, or {seq}',
      )
    }

    // Warn if no sequence placeholder (not an error, but might cause issues)
    const hasSequence = /{sequence}|{seq}/.test(format)
    if (!hasSequence) {
      errors.push(
        'Warning: Format does not include {sequence} or {seq}. Document numbers may not be unique if multiple documents are created on the same date.',
      )
    }

    // Check for both sequence placeholders (not allowed)
    if (format.includes('{sequence}') && format.includes('{seq}')) {
      errors.push(
        'Format cannot contain both {sequence} and {seq} placeholders',
      )
    }

    // Check for invalid placeholders
    const validPlaceholders = [
      'prefix',
      'year',
      'yy',
      'month',
      'day',
      'date',
      'sequence',
      'seq',
    ]
    const placeholderPattern = /{([^}]+)}/g
    let match: RegExpExecArray | null

    while ((match = placeholderPattern.exec(format)) !== null) {
      const placeholder = match[1]
      if (!validPlaceholders.includes(placeholder)) {
        errors.push(`Invalid placeholder: {${placeholder}}`)
      }
    }

    return {
      valid: errors.filter((e) => !e.startsWith('Warning:')).length === 0,
      errors,
    }
  }
}
