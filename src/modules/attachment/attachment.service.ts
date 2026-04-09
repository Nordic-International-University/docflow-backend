import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import {
  AttachmentCreateRequest,
  AttachmentCreateResponse,
  AttachmentDeleteRequest,
  AttachmentRetrieveAllRequest,
  AttachmentRetrieveAllResponse,
  AttachmentRetrieveOneRequest,
  AttachmentRetrieveOneResponse,
  AttachmentUpdateRequest,
} from './interfaces'
import { PrismaService } from '@prisma'
import { MinioService } from '@clients'
import { ROLE_NAMES } from '@constants'

@Injectable()
export class AttachmentService {
  private readonly logger = new Logger(AttachmentService.name)
  readonly #_prisma: PrismaService
  readonly #_minio: MinioService

  constructor(prisma: PrismaService, minio: MinioService) {
    this.#_prisma = prisma
    this.#_minio = minio
  }

  /**
   * Decodes filename from multer to properly handle Cyrillic and other non-ASCII characters.
   * Browsers may encode filenames in Content-Disposition header using Latin-1 or percent-encoding.
   */
  private decodeFileName(originalName: string): string {
    if (!originalName) return originalName

    try {
      // Strategy 1: Check if filename is already valid UTF-8 and contains Cyrillic
      // If it contains valid Cyrillic characters, return as-is
      if (/[\u0400-\u04FF]/.test(originalName)) {
        return originalName
      }

      // Strategy 2: Try to decode percent-encoded UTF-8 (e.g., %D0%A4%D0%B0%D0%B9%D0%BB.pdf)
      if (originalName.includes('%')) {
        try {
          const decoded = decodeURIComponent(originalName)
          // Verify the decoded string is valid
          if (decoded !== originalName && /[\u0400-\u04FF]/.test(decoded)) {
            return decoded
          }
        } catch {
          // Continue to next strategy
        }
      }

      // Strategy 3: Fix Latin-1 misinterpretation of UTF-8 bytes
      // This happens when UTF-8 bytes are incorrectly interpreted as Latin-1
      // Example: "Файл" might come as "Ð¤Ð°Ð¹Ð»"
      try {
        // Check if the string contains high-byte characters that suggest Latin-1 encoding
        if (/[\x80-\xFF]/.test(originalName)) {
          const bytes = Buffer.from(originalName, 'latin1')
          const utf8String = bytes.toString('utf8')

          // Verify the decoded string contains valid UTF-8 characters
          // Check for Cyrillic, Chinese, Arabic, or other non-Latin scripts
          if (/[\u0400-\u04FF\u4E00-\u9FFF\u0600-\u06FF]/.test(utf8String)) {
            return utf8String
          }
        }
      } catch {
        // Continue to next strategy
      }

      // Strategy 4: Try Buffer conversion with different encodings
      try {
        // Convert from latin1 and see if we get valid UTF-8
        const buffer = Buffer.from(originalName, 'binary')
        const decoded = buffer.toString('utf8')

        // Check if decoded version has Cyrillic or other non-ASCII characters
        if (decoded !== originalName && /[\u0400-\u04FF]/.test(decoded)) {
          return decoded
        }
      } catch {
        // Continue to fallback
      }

      // Strategy 5: Return original if all decoding attempts fail
      return originalName
    } catch (error) {
      // If any unexpected error occurs, return original filename
      this.logger.error('Error decoding filename:', error)
      return originalName
    }
  }

  async attachmentRetrieveAll(
    payload: AttachmentRetrieveAllRequest & {
      userId?: string
      roleName?: string
    },
  ): Promise<AttachmentRetrieveAllResponse> {
    const pageNumber = payload.pageNumber ? Number(payload.pageNumber) : 1
    const pageSize = payload.pageSize ? Number(payload.pageSize) : 10
    const skip = (pageNumber - 1) * pageSize
    const take = pageSize

    const isAdmin =
      payload.roleName === ROLE_NAMES.ADMIN ||
      payload.roleName === ROLE_NAMES.SUPER_ADMIN

    const search = payload.search ? payload.search : undefined

    const attachmentList = await this.#_prisma.attachment.findMany({
      where: {
        deletedAt: null,
        ...(search && {
          OR: [{ fileName: { contains: search, mode: 'insensitive' } }],
        }),
        ...(payload.documentId && { documentId: payload.documentId }),
        ...(payload.uploadedById && { uploadedById: payload.uploadedById }),
        // Filter by user access: user uploaded it OR has access to the document
        ...(!isAdmin &&
          payload.userId && {
            OR: [
              { uploadedById: payload.userId },
              {
                document: {
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
                },
              },
            ],
          }),
      },
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
        fileSize: true,
        mimeType: true,
        uploadedBy: {
          select: {
            id: true,
            fullname: true,
            username: true,
          },
        },
        document: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take,
      skip,
    })

    const total = await this.#_prisma.attachment.count({
      where: {
        deletedAt: null,
        ...(search && {
          OR: [{ fileName: { contains: search, mode: 'insensitive' } }],
        }),
        ...(payload.documentId && { documentId: payload.documentId }),
        ...(payload.uploadedById && { uploadedById: payload.uploadedById }),
        // Filter by user access: user uploaded it OR has access to the document
        ...(!isAdmin &&
          payload.userId && {
            OR: [
              { uploadedById: payload.userId },
              {
                document: {
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
                },
              },
            ],
          }),
      },
    })

    return {
      count: total,
      pageNumber,
      pageSize,
      pageCount: Math.ceil(total / pageSize),
      data: attachmentList.map((attachment) => ({
        ...attachment,
        createdAt: attachment.createdAt,
      })),
    }
  }

  async attachmentRetrieveOne(
    payload: AttachmentRetrieveOneRequest & {
      userId?: string
      roleName?: string
    },
  ): Promise<AttachmentRetrieveOneResponse> {
    const isAdmin =
      payload.roleName === ROLE_NAMES.ADMIN ||
      payload.roleName === ROLE_NAMES.SUPER_ADMIN

    const attachment = await this.#_prisma.attachment.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
        // Filter by user access: user uploaded it OR has access to the document
        ...(!isAdmin &&
          payload.userId && {
            OR: [
              { uploadedById: payload.userId },
              {
                document: {
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
                },
              },
            ],
          }),
      },
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
        fileSize: true,
        mimeType: true,
        documentId: true,
        uploadedById: true,
        uploadedBy: {
          select: {
            id: true,
            fullname: true,
            username: true,
          },
        },
        document: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    })

    if (!attachment) {
      throw new NotFoundException('Attachment not found')
    }

    return {
      ...attachment,
      createdAt: attachment.createdAt,
      updatedAt: attachment.updatedAt,
      deletedAt: attachment.deletedAt,
    }
  }

  async attachmentCreate(
    payload: AttachmentCreateRequest,
  ): Promise<AttachmentCreateResponse> {
    if (!payload.file) {
      throw new BadRequestException(
        'No file provided. Make sure the request is multipart/form-data with field name "file"',
      )
    }

    const uploadedFileName = await this.#_minio.uploadFile(
      payload.file,
      'attachments/',
    )

    const fileUrl = this.#_minio.buildFileUrl(uploadedFileName)

    const decodedFileName = this.decodeFileName(payload.file.originalname)

    const attachment = await this.#_prisma.attachment.create({
      data: {
        fileName: decodedFileName,
        fileUrl: fileUrl,
        fileSize: payload.file.size,
        mimeType: payload.file.mimetype,
        uploadedById: payload.uploadedById,
      },
    })

    return {
      id: attachment.id,
      fileName: attachment.fileName,
      fileUrl: attachment.fileUrl,
      fileSize: attachment.fileSize,
      mimeType: attachment.mimeType,
    }
  }

  async attachmentUpdate(payload: AttachmentUpdateRequest): Promise<void> {
    const attachment = await this.#_prisma.attachment.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
    })

    if (!attachment) {
      throw new NotFoundException('Attachment not found')
    }

    if (
      (payload.fileName && payload.fileName !== attachment.fileName) ||
      (payload.fileUrl && payload.fileUrl !== attachment.fileUrl)
    ) {
      const existingAttachment = await this.#_prisma.attachment.findFirst({
        where: {
          fileName: payload.fileName || attachment.fileName,
          fileUrl: payload.fileUrl || attachment.fileUrl,
          deletedAt: null,
          NOT: {
            id: payload.id,
          },
        },
      })

      if (existingAttachment) {
        throw new ForbiddenException(
          'Attachment with same file name and URL already exists',
        )
      }
    }

    if (payload.documentId) {
      const document = await this.#_prisma.document.findFirst({
        where: {
          id: payload.documentId,
          deletedAt: null,
        },
      })

      if (!document) {
        throw new NotFoundException('Document not found')
      }
    }

    if (payload.uploadedById) {
      const user = await this.#_prisma.user.findFirst({
        where: {
          id: payload.uploadedById,
          deletedAt: null,
        },
      })

      if (!user) {
        throw new NotFoundException('User not found')
      }
    }

    const updateData: any = {
      fileName: payload.fileName,
      fileUrl: payload.fileUrl,
      fileSize: payload.fileSize,
      mimeType: payload.mimeType,
      documentId: payload.documentId,
      uploadedById: payload.uploadedById,
    }

    await this.#_prisma.attachment.update({
      where: {
        id: payload.id,
      },
      data: updateData,
    })
  }

  async attachmentDelete(payload: AttachmentDeleteRequest): Promise<void> {
    const attachment = await this.#_prisma.attachment.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
    })

    if (!attachment) {
      throw new NotFoundException('Attachment not found')
    }

    await this.#_prisma.attachment.update({
      where: {
        id: payload.id,
      },
      data: {
        deletedAt: new Date(),
      },
    })
  }

  /**
   * Repair existing attachment filenames that have mangled Cyrillic characters.
   * This method fetches all attachments and applies the decodeFileName logic
   * to fix any incorrectly encoded filenames.
   *
   * @returns Object containing statistics about the repair operation
   */
  async repairExistingFilenames(): Promise<{
    total: number
    fixed: number
    unchanged: number
    errors: number
    details: Array<{ id: string; oldName: string; newName: string }>
  }> {
    const stats = {
      total: 0,
      fixed: 0,
      unchanged: 0,
      errors: 0,
      details: [] as Array<{ id: string; oldName: string; newName: string }>,
    }

    try {
      // Fetch all attachments (including soft-deleted ones if needed)
      const attachments = await this.#_prisma.attachment.findMany({
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          fileName: true,
        },
      })

      stats.total = attachments.length
      this.logger.log(`Found ${stats.total} attachments to check`)

      for (const attachment of attachments) {
        try {
          const originalName = attachment.fileName
          const decodedName = this.decodeFileName(originalName)

          // Only update if the name actually changed
          if (decodedName !== originalName) {
            await this.#_prisma.attachment.update({
              where: { id: attachment.id },
              data: { fileName: decodedName },
            })

            stats.fixed++
            stats.details.push({
              id: attachment.id,
              oldName: originalName,
              newName: decodedName,
            })

            this.logger.log(
              `Fixed: "${originalName}" → "${decodedName}" (ID: ${attachment.id})`,
            )
          } else {
            stats.unchanged++
          }
        } catch (error) {
          stats.errors++
          this.logger.error(
            `Error fixing filename for attachment ${attachment.id}:`,
            error,
          )
        }
      }

      this.logger.log('\n=== Repair Summary ===')
      this.logger.log(`Total attachments: ${stats.total}`)
      this.logger.log(`Fixed: ${stats.fixed}`)
      this.logger.log(`Unchanged: ${stats.unchanged}`)
      this.logger.log(`Errors: ${stats.errors}`)

      return stats
    } catch (error) {
      this.logger.error('Error during filename repair operation:', error)
      throw error
    }
  }
}
