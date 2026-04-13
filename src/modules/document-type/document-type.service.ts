import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '@prisma'
import { AuditLogService } from '../audit-log/audit-log.service'
import { AuditAction } from '../audit-log/interfaces/audit-log-enums'
import {
  DocumentTypeCreateRequest,
  DocumentTypeDeleteRequest,
  DocumentTypeRetrieveAllRequest,
  DocumentTypeRetrieveAllResponse,
  DocumentTypeRetrieveOneRequest,
  DocumentTypeUpdateRequest,
  DocumentTypeRetrieveOneResponse,
} from './interfaces'
import { parsePagination } from '@common/helpers'

@Injectable()
export class DocumentTypeService {
  readonly #_prisma: PrismaService
  readonly #_auditLogService: AuditLogService

  constructor(prisma: PrismaService, auditLogService: AuditLogService) {
    this.#_prisma = prisma
    this.#_auditLogService = auditLogService
  }

  async documentTypeCreate(payload: DocumentTypeCreateRequest): Promise<void> {
    const existingDocumentType = await this.#_prisma.documentType.findFirst({
      where: {
        name: payload.name,
        deletedAt: null,
      },
    })

    if (existingDocumentType) {
      throw new ConflictException("Hujjat turi nomi noyob bo'lishi kerak")
    }

    const createdDocumentType = await this.#_prisma.documentType.create({
      data: {
        name: payload.name,
        description: payload.description,
        isActive: payload.isActive ?? true,
      },
    })

    // Log document type creation
    await this.#_auditLogService.logAction(
      'DocumentType',
      createdDocumentType.id,
      AuditAction.CREATE,
      payload.createdBy || createdDocumentType.id,
      {
        newValues: {
          name: createdDocumentType.name,
          description: createdDocumentType.description,
          isActive: createdDocumentType.isActive,
        },
      },
    )
  }

  async documentTypeRetrieveAll(
    payload: DocumentTypeRetrieveAllRequest,
  ): Promise<DocumentTypeRetrieveAllResponse> {
    const { page, limit, skip } = parsePagination(payload)
    const search = payload.search ? payload.search : undefined
    const isActive =
      payload.isActive !== undefined ? Boolean(payload.isActive) : undefined

    const documentTypeList = await this.#_prisma.documentType.findMany({
      where: {
        deletedAt: null,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(isActive !== undefined && { isActive }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    })

    const count = await this.#_prisma.documentType.count({
      where: {
        deletedAt: null,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return {
      data: documentTypeList,
      count: count,
      pageNumber: page,
      pageSize: limit,
    }
  }

  async documentTypeRetrieveOne(
    payload: DocumentTypeRetrieveOneRequest,
  ): Promise<DocumentTypeRetrieveOneResponse> {
    const documentType = await this.#_prisma.documentType.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    })

    if (!documentType) {
      throw new NotFoundException('Hujjat turi topilmadi')
    }

    return documentType
  }

  async documentTypeUpdate(payload: DocumentTypeUpdateRequest): Promise<void> {
    const { id, updatedBy, ...updateData } = payload

    // Check if document type exists
    const existingDocumentType = await this.#_prisma.documentType.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!existingDocumentType) {
      throw new NotFoundException('Hujjat turi topilmadi')
    }

    // Check if name is being updated and if it conflicts with existing document type
    if (updateData.name && updateData.name !== existingDocumentType.name) {
      const nameExists = await this.#_prisma.documentType.findFirst({
        where: {
          name: updateData.name,
          deletedAt: null,
          NOT: {
            id,
          },
        },
      })

      if (nameExists) {
        throw new ConflictException("Hujjat turi nomi noyob bo'lishi kerak")
      }
    }

    await this.#_prisma.documentType.update({
      where: {
        id,
      },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    })

    // Track changes for audit log
    const changes: Record<string, unknown> = {}
    if (updateData.name && updateData.name !== existingDocumentType.name) {
      changes.name = { old: existingDocumentType.name, new: updateData.name }
    }
    if (
      updateData.description &&
      updateData.description !== existingDocumentType.description
    ) {
      changes.description = {
        old: existingDocumentType.description,
        new: updateData.description,
      }
    }
    if (
      updateData.isActive !== undefined &&
      updateData.isActive !== existingDocumentType.isActive
    ) {
      changes.isActive = {
        old: existingDocumentType.isActive,
        new: updateData.isActive,
      }
    }

    if (Object.keys(changes).length > 0) {
      await this.#_auditLogService.logAction(
        'DocumentType',
        id,
        AuditAction.UPDATE,
        updatedBy || id,
        { changes },
      )
    }
  }

  async documentTypeDelete(payload: DocumentTypeDeleteRequest): Promise<void> {
    // Check if document type exists
    const existingDocumentType = await this.#_prisma.documentType.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
    })

    if (!existingDocumentType) {
      throw new NotFoundException('Hujjat turi topilmadi')
    }

    await this.#_prisma.documentType.update({
      where: {
        id: payload.id,
      },
      data: {
        deletedAt: new Date(),
      },
    })

    // Log document type deletion
    await this.#_auditLogService.logAction(
      'DocumentType',
      payload.id,
      AuditAction.DELETE,
      payload.deletedBy || payload.id,
      {
        oldValues: {
          name: existingDocumentType.name,
          description: existingDocumentType.description,
          isActive: existingDocumentType.isActive,
        },
      },
    )
  }
}
