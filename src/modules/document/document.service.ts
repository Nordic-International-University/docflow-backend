import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common'
import { PrismaService } from '@prisma'
import {
  DocumentCreateRequest,
  DocumentUpdateRequest,
  DocumentDeleteRequest,
  DocumentRetrieveAllRequest,
  DocumentRetrieveOneRequest,
  DocumentRetrieveAllResponse,
  DocumentRetrieveOneResponse,
} from './interfaces'
import { DocumentStatus } from '@prisma/client'

import {
  DocumentAttachmentSelect,
  DocumentHistoryResponse,
  DocumentPublicVerificationResponse,
  DocumentBlankResponse,
  DocumentTemplateWithFile,
} from './document.types'
import { DocumentHistoryService } from './document-history.service'
import { DocumentPublicService } from './document-public.service'

interface DocumentRetrieveOneExtended extends DocumentRetrieveOneResponse {
  pdfUrl: string | null
  xfdfUrl: string | null
  journal: {
    id: string
    name: string
    prefix: string
    format: string | null
  } | null
  primaryAttachment: DocumentAttachmentSelect | null
  displayMode: 'EDIT_DOCX' | 'ANNOTATE_PDF' | 'VIEW_PDF' | 'NONE'
  canEdit: boolean
  hasDocx: boolean
  hasPdf: boolean
  docxAttachment: DocumentAttachmentSelect | null
  pdfAttachment: DocumentAttachmentSelect | null
}
import { MinioService } from '@clients'
import {
  PdfConverterUtil,
  DocumentGeneratorUtil,
  DocumentNumberGenerator,
} from '@common'
import { popCachedPdf } from '@common/utils/pdf-conversion-cache'
import {
  createBlankDocx,
  createBlankXlsx,
  createBlankPptx,
} from '@common/utils/blank-document.util'
import { WorkflowPermissionService } from '../wopi/workflow-permission.service'
import { AuditLogService } from '../audit-log'
import { AuditAction } from '../audit-log'
import { isAdmin, isSuperAdmin } from '@common/helpers'
import { parsePagination } from '@common/helpers'
import { accessibleBy } from '@casl/prisma'
import { AppAbility } from '../../casl/casl.types'

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name)
  readonly #_prisma: PrismaService
  readonly #_minio: MinioService
  readonly #_workflowPermissionService: WorkflowPermissionService
  readonly #_auditLogService: AuditLogService
  readonly #_historyService: DocumentHistoryService
  readonly #_publicService: DocumentPublicService

  constructor(
    prisma: PrismaService,
    minio: MinioService,
    workflowPermissionService: WorkflowPermissionService,
    auditLogService: AuditLogService,
    historyService: DocumentHistoryService,
    publicService: DocumentPublicService,
  ) {
    this.#_prisma = prisma
    this.#_minio = minio
    this.#_workflowPermissionService = workflowPermissionService
    this.#_auditLogService = auditLogService
    this.#_historyService = historyService
    this.#_publicService = publicService
  }

  async documentRetrieveAll(
    payload: DocumentRetrieveAllRequest,
  ): Promise<DocumentRetrieveAllResponse> {
    const { page, limit, skip } = parsePagination(payload)
    const search = payload.search ? payload.search : undefined

    const searchCondition = search
      ? [
          { title: { contains: search, mode: 'insensitive' as const } },
          {
            documentNumber: { contains: search, mode: 'insensitive' as const },
          },
          { description: { contains: search, mode: 'insensitive' as const } },
        ]
      : undefined

    // ABAC: ability borsa CASL accessibleBy, yo'qsa eski manual filter (backward compat)
    const userAccessFilter = payload.ability
      ? accessibleBy(payload.ability, 'read').Document
      : !isAdmin(payload.roleName) && payload.userId
        ? {
            OR: [
              { createdById: payload.userId },
              {
                workflow: {
                  some: {
                    workflowSteps: {
                      some: {
                        assignedToUserId: payload.userId,
                        deletedAt: null,
                      },
                    },
                    deletedAt: null,
                  },
                },
              },
            ],
          }
        : {}

    // Status validation — noto'g'ri enum Prisma'ga tushmasdan oldin 400
    const validStatuses = Object.values(DocumentStatus)
    if (
      payload.status &&
      !validStatuses.includes(payload.status as DocumentStatus)
    ) {
      throw new BadRequestException(
        `Noto'g'ri status: "${payload.status}". Mavjud: ${validStatuses.join(', ')}`,
      )
    }

    const documentList = await this.#_prisma.document.findMany({
      where: {
        deletedAt: null,
        ...(searchCondition && { OR: searchCondition }),
        ...(payload.status && { status: payload.status as DocumentStatus }),
        ...(payload.documentTypeId && {
          documentTypeId: payload.documentTypeId,
        }),
        ...(payload.journalId && { journalId: payload.journalId }),
        ...(payload.templateId && { templateId: payload.templateId }),
        ...userAccessFilter,
      },
      select: {
        id: true,
        title: true,
        description: true,
        documentNumber: true,
        status: true,
        documentType: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            fullname: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            fullname: true,
          },
        },
        pdfUrl: true,
        attachments: {
          where: { deletedAt: null },
          select: {
            id: true,
            fileName: true,
            fileSize: true,
            fileUrl: true,
            mimeType: true,
            isAutoGenerated: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        journal: {
          select: {
            id: true,
            name: true,
            prefix: true,
            format: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    })

    const count = await this.#_prisma.document.count({
      where: {
        deletedAt: null,
        ...(searchCondition && { OR: searchCondition }),
        ...(payload.status && { status: payload.status }),
        ...(payload.documentTypeId && {
          documentTypeId: payload.documentTypeId,
        }),
        ...(payload.journalId && { journalId: payload.journalId }),
        ...(payload.templateId && { templateId: payload.templateId }),
        ...userAccessFilter,
      },
    })

    return {
      data: documentList,
      count: count,
      pageNumber: page,
      pageSize: limit,
      pageCount: Math.ceil(count / limit),
    }
  }

  async documentRetrieveOne(
    payload: DocumentRetrieveOneRequest,
  ): Promise<DocumentRetrieveOneResponse> {
    const admin = isAdmin(payload.roleName)

    // ABAC: ability borsa CASL, yo'qsa eski manual filter
    const abilityFilter = payload.ability
      ? accessibleBy(payload.ability, 'read').Document
      : !admin && payload.userId
        ? {
            OR: [
              { createdById: payload.userId },
              {
                workflow: {
                  some: {
                    workflowSteps: {
                      some: {
                        assignedToUserId: payload.userId,
                        deletedAt: null,
                      },
                    },
                    deletedAt: null,
                  },
                },
              },
            ],
          }
        : {}

    const document = await this.#_prisma.document.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
        ...abilityFilter,
      },
      select: {
        id: true,
        title: true,
        description: true,
        documentNumber: true,
        status: true,
        documentType: {
          select: {
            id: true,
            name: true,
          },
        },
        journal: {
          select: {
            id: true,
            name: true,
            prefix: true,
            format: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            fullname: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            fullname: true,
          },
        },
        pdfUrl: true,
        xfdfUrl: true,
        attachments: {
          where: { deletedAt: null },
          select: {
            id: true,
            fileName: true,
            fileUrl: true,
            fileSize: true,
            mimeType: true,
            isAutoGenerated: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!document) {
      throw new NotFoundException('Document not found')
    }

    const atts: DocumentAttachmentSelect[] = document.attachments || []
    const OFFICE_MIMES = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint',
    ]
    const latestDocx =
      atts.find((a) => OFFICE_MIMES.includes(a.mimeType)) || null
    const latestPdf = atts.find((a) => a.mimeType === 'application/pdf') || null

    const isCreator = document.createdBy?.id === payload.userId
    const isPlatformAdmin = isAdmin(payload.roleName)

    let primaryAttachment: DocumentAttachmentSelect | null = null
    let displayMode: 'EDIT_DOCX' | 'ANNOTATE_PDF' | 'VIEW_PDF' | 'NONE' = 'NONE'
    let canEdit = false

    const status = document.status
    const isDraft = status === 'DRAFT' || status === 'REJECTED'
    const isWorkflowActive = status === 'PENDING' || status === 'IN_REVIEW'
    const isFinal = status === 'APPROVED' || status === 'ARCHIVED'

    if (isDraft && (isCreator || isPlatformAdmin) && latestDocx) {
      // Yaratuvchi DOCX'ni Collabora'da to'liq tahrirlay oladi
      primaryAttachment = latestDocx
      displayMode = 'EDIT_DOCX'
      canEdit = true
    } else if (isWorkflowActive && latestPdf) {
      // Workflow active — PDF'ni ochish (annotation user huquqiga bog'liq)
      primaryAttachment = latestPdf
      displayMode = 'ANNOTATE_PDF'
      canEdit = false // frontend WOPI orqali aniqlaydi
    } else if (isFinal && latestPdf) {
      primaryAttachment = latestPdf
      displayMode = 'VIEW_PDF'
      canEdit = false
    } else if (latestPdf) {
      primaryAttachment = latestPdf
      displayMode = 'VIEW_PDF'
      canEdit = false
    } else if (latestDocx && (isCreator || isPlatformAdmin)) {
      primaryAttachment = latestDocx
      displayMode = 'EDIT_DOCX'
      canEdit = true
    }

    return {
      ...document,
      attachments: latestPdf ? [latestPdf] : latestDocx ? [latestDocx] : [],
      primaryAttachment,
      displayMode,
      canEdit,
      hasDocx: !!latestDocx,
      hasPdf: !!latestPdf,
      docxAttachment: latestDocx,
      pdfAttachment: latestPdf,
    } as DocumentRetrieveOneExtended
  }

  async documentHistory(payload: {
    id: string
    userId: string
    roleName?: string
  }): Promise<DocumentHistoryResponse> {
    return this.#_historyService.getHistory(payload)
  }

  async documentCreate(payload: DocumentCreateRequest): Promise<void> {
    const documentType = await this.#_prisma.documentType.findFirst({
      where: {
        id: payload.documentTypeId,
        deletedAt: null,
      },
    })

    if (!documentType) {
      throw new NotFoundException('Document type not found')
    }

    const journal = await this.#_prisma.journal.findFirst({
      where: {
        id: payload.journalId,
        deletedAt: null,
      },
      include: {
        department: true,
      },
    })

    if (!journal) {
      throw new NotFoundException('Journal not found')
    }

    const user = await this.#_prisma.user.findFirst({
      where: {
        id: payload.userId,
        deletedAt: null,
      },
      select: {
        id: true,
        departmentId: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    // ABAC: journal departmentId tekshirish — admin hamma, dept head subordinate,
    // oddiy user faqat o'z bo'limi
    const adminUser = isAdmin(user.role?.name)
    if (journal.departmentId && !adminUser) {
      if (!user.departmentId) {
        throw new ForbiddenException(
          "Hujjat yaratish uchun bo'limga biriktirilgan bo'lishingiz kerak",
        )
      }

      // O'z bo'limi + subordinate bo'limlar (boshliq bo'lsa)
      const subordinateDeptIds: string[] = (payload as any).subordinateDeptIds ?? []
      const allowedDeptIds = new Set([user.departmentId, ...subordinateDeptIds])

      if (!allowedDeptIds.has(journal.departmentId)) {
        throw new ForbiddenException(
          "Faqat o'z bo'limingiz yoki qo'l ostingizdagi bo'limlar jurnalidan hujjat yaratishingiz mumkin",
        )
      }
    }

    const documentNumber = await DocumentNumberGenerator.generate(
      this.#_prisma,
      payload.journalId,
    )

    let templateId: string | undefined = payload.templateId || undefined
    let generatedAttachmentId: string | undefined = undefined

    if (payload.templateId && payload.tags) {
      const template = await this.#_prisma.documentTemplate.findFirst({
        where: {
          id: payload.templateId,
          deletedAt: null,
        },
        include: {
          templateFile: true,
        },
      })

      if (!template) {
        throw new NotFoundException('Document template not found')
      }

      if (template.requiredTags) {
        const validation = DocumentGeneratorUtil.validateTags(
          template.requiredTags as Record<string, unknown>,
          payload.tags,
        )

        if (!validation.valid) {
          throw new BadRequestException(
            `Missing required tags: ${validation.missing.join(', ')}`,
          )
        }
      }

      generatedAttachmentId = await this.generateDocumentFromTemplate(
        template,
        payload.tags,
        payload.userId,
      )
    } else if (payload.templateId && !payload.tags) {
      throw new BadRequestException('Tags are required when using a template')
    }

    this.logger.log(payload)

    const createdDocument = await this.#_prisma.document.create({
      data: {
        title: payload.title,
        description: payload.description,
        documentNumber: documentNumber,
        status: DocumentStatus.DRAFT,
        documentTypeId: payload.documentTypeId,
        journalId: payload.journalId,
        createdById: payload.userId,
        templateId: templateId,
      },
    })

    if (generatedAttachmentId) {
      await this.#_prisma.attachment.update({
        where: {
          id: generatedAttachmentId,
        },
        data: {
          documentId: createdDocument.id,
        },
      })
    }

    if (payload.attachments && payload.attachments.length > 0) {
      await this.#_prisma.attachment.updateMany({
        where: {
          id: {
            in: payload.attachments,
          },
        },
        data: {
          documentId: createdDocument.id,
        },
      })
    }

    await this.convertDocxToPdfForDocument(createdDocument.id, payload.userId)

    // Log document creation
    await this.#_auditLogService.logAction(
      'Document',
      createdDocument.id,
      AuditAction.CREATE,
      payload.userId,
      {
        newValues: {
          title: createdDocument.title,
          documentNumber: createdDocument.documentNumber,
          status: createdDocument.status,
          documentTypeId: createdDocument.documentTypeId,
          journalId: createdDocument.journalId,
        },
      },
    )
  }

  private async generateDocumentFromTemplate(
    template: DocumentTemplateWithFile,
    tags: Record<string, unknown>,
    userId: string,
  ): Promise<string> {
    try {
      // Extract the file path from the URL
      const templateFileUrl = template.templateFile.fileUrl
      const templateFileName = this.#_minio.extractFileName(templateFileUrl)

      // Download template file from MinIO
      const templateBuffer = await this.#_minio.getFile(templateFileName)

      // Generate document from template with tags
      const generatedDocBuffer =
        DocumentGeneratorUtil.generateDocumentFromTemplate(templateBuffer, tags)

      // Upload generated document to MinIO with sanitized filename
      const sanitizedFileName = this.#_minio.sanitizeFileName(
        template.templateFile.fileName,
      )
      const generatedFileName = `generated/${Date.now()}-${sanitizedFileName}`
      await this.#_minio.putFile(
        generatedFileName,
        generatedDocBuffer,
        template.templateFile.mimeType,
      )

      const generatedFileUrl = this.#_minio.buildFileUrl(generatedFileName)

      // Create attachment for generated document
      const generatedAttachment = await this.#_prisma.attachment.create({
        data: {
          fileName: template.templateFile.fileName,
          fileUrl: generatedFileUrl,
          fileSize: generatedDocBuffer.length,
          mimeType: template.templateFile.mimeType,
          uploadedById: userId,
          isAutoGenerated: false,
        },
      })

      this.logger.log('Document generated from template:', generatedFileUrl)
      return generatedAttachment.id
    } catch (error) {
      this.logger.error('Error generating document from template:', error)
      throw new Error(
        `Failed to generate document from template: ${error.message}`,
      )
    }
  }

  private async convertDocxToPdfForDocument(
    documentId: string,
    userId: string,
  ): Promise<void> {
    try {
      const docxAttachments = await this.#_prisma.attachment.findMany({
        where: {
          documentId: documentId,
          mimeType: {
            in: [
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/msword',
            ],
          },
          deletedAt: null,
        },
      })

      if (docxAttachments.length === 0) {
        this.logger.log('No DOCX attachments found for document:', documentId)
        return
      }

      // Get document to check for existing XFDF (for edge cases)
      const document = await this.#_prisma.document.findFirst({
        where: {
          id: documentId,
          deletedAt: null,
        },
        select: {
          xfdfUrl: true,
        },
      })

      // Process the first DOCX attachment
      const docxAttachment = docxAttachments[0]
      this.logger.log('Converting DOCX to PDF:', docxAttachment.fileName)

      // FAST PATH: attachment upload paytida DOCX pre-converted bo'lgan bo'lsa
      // (attachment.service.ts preconvertDocxToPdf), natija cache'dan olinadi.
      // MinIO download + Gotenberg chaqirig'i umuman bo'lmaydi — ~9-12 soniya
      // yutuq. XFDF merge kerak bo'lganda bu yo'l ishlatilmaydi (fallback).
      if (!document?.xfdfUrl) {
        const cached = popCachedPdf(docxAttachment.id)
        if (cached) {
          this.logger.log(
            `[docx→pdf] CACHE HIT attachment=${docxAttachment.id} ` +
              `— skipped MinIO download + Gotenberg`,
          )

          await this.#_prisma.attachment.create({
            data: {
              fileName: cached.pdfFileName,
              fileUrl: cached.pdfUrl,
              fileSize: cached.pdfFileSize,
              mimeType: 'application/pdf',
              documentId: documentId,
              uploadedById: userId,
              isAutoGenerated: true,
            },
          })

          await this.#_prisma.document.update({
            where: { id: documentId },
            data: { pdfUrl: cached.pdfUrl },
          })

          this.logger.log(
            'PDF conversion completed (from cache):',
            cached.pdfFileName,
          )
          return
        }
      }

      // SLOW PATH (fallback): cache'da yo'q yoki XFDF mavjud. MinIO'dan
      // DOCX'ni qayta yuklab olib, konvertatsiya qilish (eski xulq).
      // Extract the file path from the URL
      const fileUrl = docxAttachment.fileUrl
      const fileName = this.#_minio.extractFileName(fileUrl)

      // Get the DOCX file from MinIO
      const docxBuffer = await this.#_minio.getFile(fileName)

      // Convert DOCX to PDF
      const { pdfBuffer, fileName: pdfFileName } =
        await PdfConverterUtil.convertDocxToPdf(
          docxBuffer,
          docxAttachment.fileName,
        )

      let finalPdfBuffer = pdfBuffer
      let finalPdfFileName = pdfFileName

      // If XFDF exists, merge it with the new PDF (for edge cases or re-conversions)
      if (document?.xfdfUrl) {
        this.logger.log(
          'XFDF found during initial conversion, merging with PDF',
        )
        const xfdfBuffer = Buffer.from(document.xfdfUrl, 'utf-8')

        const { pdfBuffer: mergedPdfBuffer, fileName: mergedFileName } =
          await PdfConverterUtil.mergeXfdfToPdf(
            pdfBuffer,
            xfdfBuffer,
            pdfFileName,
          )

        finalPdfBuffer = mergedPdfBuffer
        finalPdfFileName = mergedFileName
        this.logger.log('XFDF merged successfully with PDF')
      }

      // Upload PDF to MinIO with sanitized filename
      const sanitizedPdfFileName =
        this.#_minio.sanitizeFileName(finalPdfFileName)
      const uploadedPdfFileName = `attachments/${Date.now()}-${sanitizedPdfFileName}`
      await this.#_minio.putFile(
        uploadedPdfFileName,
        finalPdfBuffer,
        'application/pdf',
      )

      const pdfUrl = this.#_minio.buildFileUrl(uploadedPdfFileName)

      // Create attachment for PDF (store original filename for display)
      await this.#_prisma.attachment.create({
        data: {
          fileName: finalPdfFileName, // Keep original name for display
          fileUrl: pdfUrl,
          fileSize: finalPdfBuffer.length,
          mimeType: 'application/pdf',
          documentId: documentId,
          uploadedById: userId,
          isAutoGenerated: true,
        },
      })

      // Update document with PDF URL
      await this.#_prisma.document.update({
        where: {
          id: documentId,
        },
        data: {
          pdfUrl: pdfUrl,
        },
      })

      this.logger.log(
        'PDF conversion completed successfully:',
        finalPdfFileName,
      )
    } catch (error) {
      this.logger.error('Error converting DOCX to PDF:', error)
      // Don't throw error to prevent document creation from failing
      // Just log the error and continue
    }
  }

  async documentUpdate(payload: DocumentUpdateRequest): Promise<void> {
    const existingDocument = await this.#_prisma.document.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
    })

    if (!existingDocument) {
      throw new NotFoundException('Document not found')
    }

    // SECURITY: faqat yaratuvchi yoki admin tahrirlashi mumkin
    if (
      payload.userId &&
      !isAdmin(payload.roleName) &&
      existingDocument.createdById !== payload.userId
    ) {
      throw new ForbiddenException(
        "Bu hujjatni tahrirlash huquqingiz yo'q",
      )
    }

    if (
      payload.documentNumber &&
      payload.documentNumber !== existingDocument.documentNumber
    ) {
      const documentWithSameNumber = await this.#_prisma.document.findFirst({
        where: {
          documentNumber: payload.documentNumber,
          deletedAt: null,
          id: { not: payload.id },
        },
      })

      if (documentWithSameNumber) {
        throw new ConflictException('Document number must be unique')
      }
    }

    if (payload.documentTypeId) {
      const documentType = await this.#_prisma.documentType.findFirst({
        where: {
          id: payload.documentTypeId,
          deletedAt: null,
        },
      })

      if (!documentType) {
        throw new NotFoundException('Document type not found')
      }
    }

    if (payload.journalId) {
      const journal = await this.#_prisma.journal.findFirst({
        where: {
          id: payload.journalId,
          deletedAt: null,
        },
      })

      if (!journal) {
        throw new NotFoundException('Journal not found')
      }
    }

    await this.#_prisma.document.update({
      where: {
        id: payload.id,
      },
      data: {
        title: payload.title,
        description: payload.description,
        status: (payload.status as DocumentStatus) ?? DocumentStatus.PENDING,
        documentTypeId: payload.documentTypeId,
        journalId: payload.journalId,
        updatedAt: new Date(),
      },
    })

    // Log document update
    const changes: Record<string, unknown> = {}
    if (payload.title && payload.title !== existingDocument.title) {
      changes.title = { old: existingDocument.title, new: payload.title }
    }
    if (
      payload.description &&
      payload.description !== existingDocument.description
    ) {
      changes.description = {
        old: existingDocument.description,
        new: payload.description,
      }
    }
    if (payload.status && payload.status !== existingDocument.status) {
      changes.status = { old: existingDocument.status, new: payload.status }
    }

    if (Object.keys(changes).length > 0) {
      await this.#_auditLogService.logAction(
        'Document',
        payload.id,
        AuditAction.UPDATE,
        payload.userId,
        {
          changes,
          oldValues: {
            title: existingDocument.title,
            description: existingDocument.description,
            status: existingDocument.status,
          },
          newValues: {
            title: payload.title || existingDocument.title,
            description: payload.description || existingDocument.description,
            status: payload.status || existingDocument.status,
          },
        },
      )
    }
  }

  async documentDelete(payload: DocumentDeleteRequest): Promise<void> {
    const admin = isAdmin(payload.roleName)

    const existingDocument = await this.#_prisma.document.findFirst({
      where: {
        id: payload.id,
        ...(!admin && payload.userId && { createdById: payload.userId }),
        deletedAt: null,
      },
    })

    if (!existingDocument) {
      throw new NotFoundException('Document not found')
    }

    await this.#_prisma.document.update({
      where: {
        id: payload.id,
      },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    })

    // Log document deletion
    await this.#_auditLogService.logAction(
      'Document',
      payload.id,
      AuditAction.DELETE,
      payload.userId,
      {
        oldValues: {
          title: existingDocument.title,
          documentNumber: existingDocument.documentNumber,
          status: existingDocument.status,
        },
      },
    )
  }

  async documentGetPdfUrl(
    documentId: string,
  ): Promise<{ pdfUrl: string | null; xfdfUrl: string | null }> {
    const document = await this.#_prisma.document.findFirst({
      where: {
        id: documentId,
        deletedAt: null,
      },
      select: {
        pdfUrl: true,
        xfdfUrl: true,
      },
    })

    if (!document) {
      throw new NotFoundException('Document not found')
    }

    return {
      pdfUrl: document.pdfUrl,
      xfdfUrl: document.xfdfUrl,
    }
  }

  async documentUpdateXfdfUrl(
    documentId: string,
    xfdfContent: string,
    userId?: string,
  ): Promise<void> {
    const document = await this.#_prisma.document.findFirst({
      where: {
        id: documentId,
        deletedAt: null,
      },
    })

    if (!document) {
      throw new NotFoundException('Document not found')
    }

    if (!document.pdfUrl) {
      throw new NotFoundException('PDF URL not found for this document')
    }

    // Check permissions: document creator and Super Admin can always edit
    let userWorkflowStep = null
    if (userId) {
      const isCreator = document.createdById === userId
      const user = await this.#_prisma.user.findFirst({
        where: { id: userId, deletedAt: null },
        select: { role: { select: { name: true } } },
      })
      const isSuper = isSuperAdmin(user?.role?.name)

      // If not creator and not super admin, verify workflow permission
      if (!isCreator && !isSuper) {
        await this.#_workflowPermissionService.verifyXfdfEditPermission(
          userId,
          documentId,
        )
      }

      // Find the user's active workflow step (if exists)
      const workflow = await this.#_prisma.workflow.findFirst({
        where: {
          documentId,
          status: 'ACTIVE',
          deletedAt: null,
        },
        include: {
          workflowSteps: {
            where: {
              assignedToUserId: userId,
              isCreator: false,
              deletedAt: null,
            },
          },
        },
      })

      if (workflow) {
        const allowedStatuses =
          workflow.type === 'CONSECUTIVE'
            ? ['IN_PROGRESS']
            : ['IN_PROGRESS', 'NOT_STARTED']

        userWorkflowStep = workflow.workflowSteps.find((step) =>
          allowedStatuses.includes(step.status),
        )
      }
    }

    try {
      // Extract file paths from URLs
      const pdfFileName = this.#_minio.extractFileName(document.pdfUrl)

      // Download original PDF from MinIO
      const pdfBuffer = await this.#_minio.getFile(pdfFileName)
      this.logger.log('Original PDF downloaded from MinIO')

      // Convert XFDF content to buffer
      const xfdfBuffer = Buffer.from(xfdfContent, 'utf-8')
      this.logger.log('XFDF content converted to buffer')

      // Extract original PDF filename
      const originalPdfFileName = pdfFileName.split('/').pop() || 'document.pdf'

      // Merge XFDF annotations into PDF
      const { pdfBuffer: mergedPdfBuffer, fileName: mergedFileName } =
        await PdfConverterUtil.mergeXfdfToPdf(
          pdfBuffer,
          xfdfBuffer,
          originalPdfFileName,
        )
      this.logger.log('XFDF merged into PDF successfully')

      // Versiya aniqlash
      const versionCount = await this.#_prisma.attachment.count({
        where: {
          documentId,
          mimeType: 'application/pdf',
          isAutoGenerated: true,
          deletedAt: null,
        },
      })
      const version = versionCount + 1

      // Tozalangan nom + versiya
      const cleanMergedName = mergedFileName
        .replace(/^\d+-/g, '')
        .replace(/^(merged-)+/g, '')
        .replace(/\s*\(v\d+\)/g, '')
      const ext = cleanMergedName.substring(cleanMergedName.lastIndexOf('.'))
      const nameWithoutExt = cleanMergedName.substring(
        0,
        cleanMergedName.lastIndexOf('.'),
      )
      const versionedName = `${nameWithoutExt} (v${version})${ext}`

      let sanitizedMergedFileName = this.#_minio.sanitizeFileName(versionedName)
      if (sanitizedMergedFileName.length > 100) {
        const extPart = sanitizedMergedFileName.substring(
          sanitizedMergedFileName.lastIndexOf('.'),
        )
        sanitizedMergedFileName =
          sanitizedMergedFileName.substring(0, 100 - extPart.length) + extPart
      }
      const uploadedPdfFileName = `attachments/${Date.now()}-${sanitizedMergedFileName}`
      await this.#_minio.putFile(
        uploadedPdfFileName,
        mergedPdfBuffer,
        'application/pdf',
      )

      const mergedPdfUrl = this.#_minio.buildFileUrl(uploadedPdfFileName)
      this.logger.log('Merged PDF uploaded to MinIO:', mergedPdfUrl)

      let displayFileName = versionedName
      if (displayFileName.length > 255) {
        const ext = displayFileName.substring(displayFileName.lastIndexOf('.'))
        displayFileName = displayFileName.substring(0, 255 - ext.length) + ext
      }
      await this.#_prisma.attachment.create({
        data: {
          fileName: displayFileName,
          fileUrl: mergedPdfUrl,
          fileSize: mergedPdfBuffer.length,
          mimeType: 'application/pdf',
          documentId: documentId,
          uploadedById: userId || document.createdById,
          isAutoGenerated: true,
        },
      })

      await this.#_prisma.document.update({
        where: {
          id: documentId,
        },
        data: {
          xfdfUrl: xfdfContent,
          pdfUrl: mergedPdfUrl,
          updatedAt: new Date(),
        },
      })

      this.logger.log('Document updated with XFDF content and merged PDF URL')

      if (userWorkflowStep && userId) {
        this.logger.log(userWorkflowStep)
        await this.#_prisma.workflowStepAction.create({
          data: {
            workflowStepId: userWorkflowStep.id,
            actionType: 'COMMENTED',
            performedByUserId: userId,
            comment: 'XFDF annotations submitted',
            metadata: {
              xfdfSubmitted: true,
              xfdfSubmittedAt: new Date().toISOString(),
              actionType: userWorkflowStep.actionType,
            },
          },
        })
        this.logger.log(
          `XFDF submission recorded for user ${userId} on workflow step ${userWorkflowStep.id}`,
        )
      }
    } catch (error) {
      this.logger.error('Error updating XFDF URL and merging PDF:', error)
      throw new Error(`Failed to update XFDF and merge PDF: ${error.message}`)
    }
  }

  async documentPublicVerification(
    documentId: string,
  ): Promise<DocumentPublicVerificationResponse> {
    return this.#_publicService.verify(documentId)
  }

  async documentDownloadAccepted(
    documentId: string,
    userId?: string,
  ): Promise<{ pdfBuffer: Buffer; fileName: string }> {
    return this.#_publicService.downloadAccepted(documentId, userId)
  }

  async documentCreateWithOffice(payload: {
    title: string
    description?: string
    documentTypeId: string
    journalId: string
    fileType?: 'docx' | 'xlsx' | 'pptx'
    userId: string
  }): Promise<DocumentBlankResponse> {
    const fileType = payload.fileType || 'docx'

    // Validate document type and journal
    const documentType = await this.#_prisma.documentType.findFirst({
      where: { id: payload.documentTypeId, deletedAt: null },
    })
    if (!documentType) throw new NotFoundException('Hujjat turi topilmadi')

    const journal = await this.#_prisma.journal.findFirst({
      where: { id: payload.journalId, deletedAt: null },
    })
    if (!journal) throw new NotFoundException('Jurnal topilmadi')

    // Create minimal blank file
    const blankFiles: Record<string, Buffer> = {
      docx: createBlankDocx(),
      xlsx: createBlankXlsx(),
      pptx: createBlankPptx(),
    }

    const buffer = blankFiles[fileType]
    const mimeTypes: Record<string, string> = {
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    }

    const fileName = `${payload.title
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')}.${fileType}`

    // Upload to MinIO
    const uploadedFileName = await this.#_minio.uploadFile(
      {
        buffer,
        originalname: fileName,
        mimetype: mimeTypes[fileType],
        size: buffer.length,
      } as Express.Multer.File,
      'documents/',
    )

    const fileUrl = this.#_minio.buildFileUrl(uploadedFileName)

    const attachment = await this.#_prisma.attachment.create({
      data: {
        fileName,
        fileUrl,
        fileSize: buffer.length,
        mimeType: mimeTypes[fileType],
        uploadedById: payload.userId,
        isAutoGenerated: true,
      },
    })

    const documentNumber = await DocumentNumberGenerator.generate(
      this.#_prisma,
      payload.journalId,
    )

    const document = await this.#_prisma.document.create({
      data: {
        title: payload.title,
        description: payload.description,
        documentNumber,
        status: DocumentStatus.DRAFT,
        documentTypeId: payload.documentTypeId,
        journalId: payload.journalId,
        createdById: payload.userId,
        pdfUrl: fileUrl,
      },
    })

    await this.#_prisma.attachment.update({
      where: { id: attachment.id },
      data: { documentId: document.id },
    })

    const wopiSrc = encodeURIComponent(
      `${process.env.WOPI_HOST_URL || 'https://api.docverse.uz'}/api/v1/wopi/files/${attachment.id}`,
    )
    const collaboraBase =
      process.env.COLLABORA_URL || 'https://office.docverse.uz'
    const collaboraUrl = `${collaboraBase}/browser/dist/cool.html?WOPISrc=${wopiSrc}`

    return {
      document: {
        id: document.id,
        title: document.title,
        documentNumber: document.documentNumber,
        status: document.status,
      },
      attachment: {
        id: attachment.id,
        fileName: attachment.fileName,
        fileUrl: attachment.fileUrl,
      },
      collaboraUrl,
      wopiSrc: decodeURIComponent(wopiSrc),
      fileType,
    }
  }
}
