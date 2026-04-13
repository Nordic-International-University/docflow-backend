import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '@prisma'
import { AuditLogService } from '../audit-log/audit-log.service'
import { AuditAction } from '../audit-log/interfaces/audit-log-enums'
import {
  DocumentTemplateCreateRequest,
  DocumentTemplateDeleteRequest,
  DocumentTemplateRetrieveAllRequest,
  DocumentTemplateRetrieveAllResponse,
  DocumentTemplateRetrieveOneRequest,
  DocumentTemplateUpdateRequest,
  DocumentTemplateRetrieveOneResponse,
} from './interfaces'
import { parsePagination } from '@common/helpers'

@Injectable()
export class DocumentTemplateService {
  readonly #_prisma: PrismaService
  readonly #_auditLogService: AuditLogService

  constructor(prisma: PrismaService, auditLogService: AuditLogService) {
    this.#_prisma = prisma
    this.#_auditLogService = auditLogService
  }

  async documentTemplateCreate(
    payload: DocumentTemplateCreateRequest,
  ): Promise<void> {
    // Check if template name already exists
    const existingTemplate = await this.#_prisma.documentTemplate.findFirst({
      where: {
        name: payload.name,
        deletedAt: null,
      },
    })

    if (existingTemplate) {
      throw new ConflictException(
        'Bu nomli hujjat shabloni allaqachon mavjud',
      )
    }

    // Check if document type exists
    const documentType = await this.#_prisma.documentType.findFirst({
      where: {
        id: payload.documentTypeId,
        deletedAt: null,
      },
    })

    if (!documentType) {
      throw new NotFoundException('Hujjat turi topilmadi')
    }

    const createdTemplate = await this.#_prisma.documentTemplate.create({
      data: {
        name: payload.name,
        description: payload.description,
        templateFileId: payload.templateFileId,
        documentTypeId: payload.documentTypeId,
        requiredTags: payload.requiredTags || null,
        isActive: payload.isActive !== undefined ? payload.isActive : true,
        isPublic: payload.isPublic !== undefined ? payload.isPublic : true,
      },
    })

    // Log document template creation
    await this.#_auditLogService.logAction(
      'DocumentTemplate',
      createdTemplate.id,
      AuditAction.CREATE,
      payload.createdBy || createdTemplate.id,
      {
        newValues: {
          name: createdTemplate.name,
          description: createdTemplate.description,
          documentTypeId: createdTemplate.documentTypeId,
          templateFileId: createdTemplate.templateFileId,
          isActive: createdTemplate.isActive,
          isPublic: createdTemplate.isPublic,
        },
      },
    )
  }

  async documentTemplateRetrieveAll(
    payload: DocumentTemplateRetrieveAllRequest,
  ): Promise<any> {
    const { page, limit, skip } = parsePagination(payload)
    const search = payload.search ? payload.search : undefined

    const templateList = await this.#_prisma.documentTemplate.findMany({
      where: {
        deletedAt: null,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(payload.documentTypeId && {
          documentTypeId: payload.documentTypeId,
        }),
        ...(payload.isActive !== undefined && {
          isActive: payload.isActive,
        }),
        ...(payload.isPublic !== undefined && {
          isPublic: payload.isPublic,
        }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        requiredTags: true,
        isActive: true,
        isPublic: true,
        documentType: {
          select: {
            id: true,
            name: true,
          },
        },
        templateFile: {
          select: {
            id: true,
            fileName: true,
            fileSize: true,
            fileUrl: true,
            mimeType: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    })

    const count = await this.#_prisma.documentTemplate.count({
      where: {
        deletedAt: null,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(payload.documentTypeId && {
          documentTypeId: payload.documentTypeId,
        }),
        ...(payload.isActive !== undefined && {
          isActive: payload.isActive,
        }),
        ...(payload.isPublic !== undefined && {
          isPublic: payload.isPublic,
        }),
      },
    })

    const pageCount = Math.ceil(count / limit)

    return {
      data: templateList,
      count: count,
      pageNumber: page,
      pageSize: limit,
      pageCount,
    }
  }

  async documentTemplateRetrieveOne(
    payload: DocumentTemplateRetrieveOneRequest,
  ): Promise<DocumentTemplateRetrieveOneResponse> {
    const template = await this.#_prisma.documentTemplate.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        requiredTags: true,
        isActive: true,
        isPublic: true,
        documentType: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        templateFile: {
          select: {
            id: true,
            fileName: true,
            fileSize: true,
            fileUrl: true,
            mimeType: true,
          },
        },
      },
    })

    if (!template) {
      throw new NotFoundException('Hujjat shabloni topilmadi')
    }

    return template
  }

  async documentTemplateUpdate(
    payload: DocumentTemplateUpdateRequest,
  ): Promise<void> {
    const { id, updatedBy, ...updateData } = payload

    const existingTemplate = await this.#_prisma.documentTemplate.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!existingTemplate) {
      throw new NotFoundException('Hujjat shabloni topilmadi')
    }

    // Check if name is being updated and if it conflicts with another template
    if (updateData.name && updateData.name !== existingTemplate.name) {
      const nameExists = await this.#_prisma.documentTemplate.findFirst({
        where: {
          name: updateData.name,
          deletedAt: null,
          id: { not: id },
        },
      })

      if (nameExists) {
        throw new ConflictException(
          'Bu nomli hujjat shabloni allaqachon mavjud',
        )
      }
    }

    // Check if document type is being updated and if it exists
    if (updateData.documentTypeId) {
      const documentType = await this.#_prisma.documentType.findFirst({
        where: {
          id: updateData.documentTypeId,
          deletedAt: null,
        },
      })

      if (!documentType) {
        throw new NotFoundException('Hujjat turi topilmadi')
      }
    }

    await this.#_prisma.documentTemplate.update({
      where: {
        id,
      },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    })

    // Track changes for audit log
    const changes: Record<string, any> = {}
    if (updateData.name && updateData.name !== existingTemplate.name) {
      changes.name = { old: existingTemplate.name, new: updateData.name }
    }
    if (
      updateData.description !== undefined &&
      updateData.description !== existingTemplate.description
    ) {
      changes.description = {
        old: existingTemplate.description,
        new: updateData.description,
      }
    }
    if (
      updateData.documentTypeId &&
      updateData.documentTypeId !== existingTemplate.documentTypeId
    ) {
      changes.documentTypeId = {
        old: existingTemplate.documentTypeId,
        new: updateData.documentTypeId,
      }
    }
    if (
      updateData.templateFileId &&
      updateData.templateFileId !== existingTemplate.templateFileId
    ) {
      changes.templateFileId = {
        old: existingTemplate.templateFileId,
        new: updateData.templateFileId,
      }
    }
    if (
      updateData.isActive !== undefined &&
      updateData.isActive !== existingTemplate.isActive
    ) {
      changes.isActive = {
        old: existingTemplate.isActive,
        new: updateData.isActive,
      }
    }
    if (
      updateData.isPublic !== undefined &&
      updateData.isPublic !== existingTemplate.isPublic
    ) {
      changes.isPublic = {
        old: existingTemplate.isPublic,
        new: updateData.isPublic,
      }
    }

    if (Object.keys(changes).length > 0) {
      await this.#_auditLogService.logAction(
        'DocumentTemplate',
        id,
        AuditAction.UPDATE,
        updatedBy || id,
        { changes },
      )
    }
  }

  async documentTemplateDelete(
    payload: DocumentTemplateDeleteRequest,
  ): Promise<void> {
    const existingTemplate = await this.#_prisma.documentTemplate.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
    })

    if (!existingTemplate) {
      throw new NotFoundException('Hujjat shabloni topilmadi')
    }

    // Check if template is being used by any documents
    const documentsUsingTemplate = await this.#_prisma.document.count({
      where: {
        templateId: payload.id,
        deletedAt: null,
      },
    })

    if (documentsUsingTemplate > 0) {
      throw new ConflictException(
        "Hujjatlarda ishlatilayotgan shablonni o'chirib bo'lmaydi",
      )
    }

    await this.#_prisma.documentTemplate.update({
      where: {
        id: payload.id,
      },
      data: {
        deletedAt: new Date(),
      },
    })

    // Log document template deletion
    await this.#_auditLogService.logAction(
      'DocumentTemplate',
      payload.id,
      AuditAction.DELETE,
      payload.deletedBy || payload.id,
      {
        oldValues: {
          name: existingTemplate.name,
          description: existingTemplate.description,
          documentTypeId: existingTemplate.documentTypeId,
          templateFileId: existingTemplate.templateFileId,
          isActive: existingTemplate.isActive,
          isPublic: existingTemplate.isPublic,
        },
      },
    )
  }
}
