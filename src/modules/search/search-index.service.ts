/**
 * Search Index Service — PDF/Word matn extraction + indekslash.
 *
 * Attachment yuklanganida yoki hujjat yaratilganida chaqiriladi.
 * PDF/DOCX fayldan matnni chiqarib search_index jadvaliga saqlaydi.
 * SearchService shu jadvaldan qidiradi.
 */

import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '@prisma'
import { MinioService } from '@clients'
import { PdfConverterUtil } from '@common'
import PizZip from 'pizzip'

@Injectable()
export class SearchIndexService {
  private readonly logger = new Logger(SearchIndexService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
  ) {}

  /**
   * Hujjatning barcha attachment'larini indekslash.
   * Document yaratilganda yoki attachment yuklanganida chaqiriladi.
   */
  async indexDocumentAttachments(documentId: string): Promise<void> {
    try {
      const document = await this.prisma.document.findFirst({
        where: { id: documentId, deletedAt: null },
        select: {
          id: true,
          title: true,
          description: true,
          documentNumber: true,
          status: true,
          attachments: {
            where: { deletedAt: null },
            select: {
              id: true,
              fileName: true,
              fileUrl: true,
              mimeType: true,
            },
          },
        },
      })

      if (!document) return

      let allText = [document.title, document.description, document.documentNumber]
        .filter(Boolean)
        .join(' ')

      // Har attachment'dan matn chiqarish
      for (const att of document.attachments) {
        const text = await this.extractTextFromAttachment(att)
        if (text) {
          allText += ' ' + text
        }
      }

      // search_index jadvaliga upsert
      await this.prisma.searchIndex.upsert({
        where: {
          entityType_entityId: {
            entityType: 'document',
            entityId: documentId,
          },
        },
        create: {
          entityType: 'document',
          entityId: documentId,
          title: document.title,
          content: allText.substring(0, 50000), // 50KB limit
          metadata: {
            status: document.status,
            documentNumber: document.documentNumber,
          },
        },
        update: {
          title: document.title,
          content: allText.substring(0, 50000),
          metadata: {
            status: document.status,
            documentNumber: document.documentNumber,
          },
        },
      })

      this.logger.log(
        `[search-index] Indexed document ${documentId} (${allText.length} chars)`,
      )
    } catch (err: any) {
      this.logger.warn(
        `[search-index] Failed to index document ${documentId}: ${err?.message}`,
      )
    }
  }

  /**
   * Attachment'dan matn chiqarish — PDF yoki DOCX.
   */
  private async extractTextFromAttachment(attachment: {
    id: string
    fileName: string
    fileUrl: string
    mimeType: string
  }): Promise<string | null> {
    try {
      const isPdf = attachment.mimeType === 'application/pdf'
      const isDocx =
        attachment.mimeType ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        attachment.mimeType === 'application/msword'

      if (!isPdf && !isDocx) return null

      // MinIO'dan fayl yuklash
      const filePath = this.minio.extractFileName(attachment.fileUrl)
      const buffer = await this.minio.getFile(filePath)

      if (isPdf) {
        return await this.extractPdfText(buffer)
      }

      if (isDocx) {
        return this.extractDocxText(buffer)
      }

      return null
    } catch (err: any) {
      this.logger.warn(
        `[search-index] Text extraction failed for ${attachment.fileName}: ${err?.message}`,
      )
      return null
    }
  }

  /**
   * PDF'dan matn chiqarish — @docverse-pdf/server SDK orqali.
   */
  private async extractPdfText(buffer: Buffer): Promise<string> {
    try {
      // Barcha sahifalardan matn chiqarish
      const pageCount = await PdfConverterUtil.getPageCount(buffer)
      const texts: string[] = []

      for (let i = 0; i < Math.min(pageCount, 50); i++) {
        // max 50 sahifa
        try {
          const text = await PdfConverterUtil.extractText(buffer, i)
          if (text) texts.push(text)
        } catch {
          // ba'zi sahifalardan matn chiqmasligi mumkin
        }
      }

      return texts.join(' ')
    } catch {
      return ''
    }
  }

  /**
   * DOCX'dan matn chiqarish — PizZip bilan XML parse.
   */
  private extractDocxText(buffer: Buffer): string {
    try {
      const zip = new PizZip(buffer)
      const docXml = zip.file('word/document.xml')
      if (!docXml) return ''

      const content = docXml.asText()
      // XML tag'larni olib tashlash, faqat matn qoldirish
      return content
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    } catch {
      return ''
    }
  }

  /**
   * Barcha mavjud hujjatlarni bulk indekslash.
   * Birinchi marta yoki qayta indekslash kerak bo'lganda chaqiriladi.
   */
  async bulkIndexAllDocuments(): Promise<{ indexed: number; errors: number }> {
    const documents = await this.prisma.document.findMany({
      where: { deletedAt: null },
      select: { id: true },
    })

    let indexed = 0
    let errors = 0

    for (const doc of documents) {
      try {
        await this.indexDocumentAttachments(doc.id)
        indexed++
      } catch {
        errors++
      }
    }

    this.logger.log(
      `[search-index] Bulk index complete: ${indexed} indexed, ${errors} errors`,
    )
    return { indexed, errors }
  }
}
