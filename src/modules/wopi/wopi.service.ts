import { Injectable, NotFoundException, Logger } from '@nestjs/common'
import { PrismaService } from '@prisma'
import { MinioService } from '@clients'
import { PdfConverterUtil } from '@common'
import {
  WopiCheckFileInfoResponse,
  WopiFileRequest,
  WopiPutFileRequest,
} from './interfaces'
import { WorkflowPermissionService } from './workflow-permission.service'

@Injectable()
export class WopiService {
  private readonly logger = new Logger(WopiService.name)
  readonly #_prisma: PrismaService
  readonly #_minio: MinioService
  readonly #_workflowPermissionService: WorkflowPermissionService

  constructor(
    prisma: PrismaService,
    minio: MinioService,
    workflowPermissionService: WorkflowPermissionService,
  ) {
    this.#_prisma = prisma
    this.#_minio = minio
    this.#_workflowPermissionService = workflowPermissionService
  }

  async checkFileInfo(
    payload: WopiFileRequest,
    userId: string,
  ): Promise<WopiCheckFileInfoResponse> {
    const attachment = await this.getFileById(payload.fileId)

    const user = await this.#_prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
        isActive: true,
      },
    })

    if (!user) {
      throw new NotFoundException("Foydalanuvchi topilmadi yoki faol emas")
    }

    // Get workflow-based permissions
    const permissions =
      await this.#_workflowPermissionService.getUserPermissionsForFile(
        userId,
        payload.fileId,
      )

    const fileExtension = attachment.fileName.split('.').pop() || ''

    this.logger.log(
      `CheckFileInfo for user ${userId}, file ${payload.fileId}: UserCanWrite=${permissions.UserCanWrite}, ReadOnly=${permissions.ReadOnly}`,
    )

    return {
      BaseFileName: attachment.fileName,
      Size: attachment.fileSize,
      Version: attachment.updatedAt.toISOString(),
      OwnerId: attachment.uploadedById || '',
      UserId: user.id,
      UserFriendlyName: user.fullname,
      LastModifiedTime: attachment.updatedAt.toISOString(),
      FileExtension: fileExtension,

      // Workflow-based permissions
      UserCanWrite: permissions.UserCanWrite,
      ReadOnly: permissions.ReadOnly,
      WebEditingDisabled: permissions.WebEditingDisabled,
      UserCanNotWriteRelative: !permissions.UserCanWrite,
      UserCanRename: false,
      UserCanAttend: permissions.UserCanRead,

      // WOPI capabilities
      SupportsUpdate: permissions.UserCanWrite,
      SupportsLocks: permissions.UserCanWrite,
      SupportsCoauth: permissions.UserCanWrite,
      SupportsUserInfo: true,
      SupportsExtendedLockLength: permissions.UserCanWrite,
      UserCanPresent: permissions.UserCanRead,
    }
  }

  async getFileContent(
    payload: WopiFileRequest,
    userId: string,
  ): Promise<Buffer> {
    const attachment = await this.getFileById(payload.fileId)

    await this.verifyUserAccess(userId)

    // Verify user has read permission based on workflow step
    await this.#_workflowPermissionService.verifyReadPermission(
      userId,
      payload.fileId,
    )

    const fileName = this.extractFileNameFromUrl(attachment.fileUrl)

    const fileContent = await this.#_minio.getFile(fileName)

    return fileContent
  }

  async putFileContent(
    payload: WopiPutFileRequest,
    userId: string,
  ): Promise<void> {
    const attachment = await this.getFileById(payload.fileId)

    await this.verifyUserAccess(userId)

    // Verify user has write permission based on workflow step
    await this.#_workflowPermissionService.verifyWritePermission(
      userId,
      payload.fileId,
    )

    this.logger.log(
      `Putting file content for fileId: ${payload.fileId} by userId: ${userId}`,
    )

    const fileName = this.extractFileNameFromUrl(attachment.fileUrl)

    // Update the file in MinIO
    await this.#_minio.putFile(fileName, payload.content, attachment.mimeType)

    // Update attachment record
    await this.#_prisma.attachment.update({
      where: {
        id: payload.fileId,
      },
      data: {
        fileSize: payload.content.length,
        updatedAt: new Date(),
      },
    })

    // Check if this is a DOCX/DOC file and has a documentId
    const isOfficeDoc = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint',
    ].includes(attachment.mimeType)

    if (isOfficeDoc && attachment.documentId) {
      this.logger.log(
        `Office document updated, triggering PDF conversion for document: ${attachment.documentId}`,
      )
      await this.reconvertAndMergeXfdf(
        attachment.documentId,
        payload.content,
        attachment.fileName,
        userId,
      )
    }
  }

  private async reconvertAndMergeXfdf(
    documentId: string,
    docxBuffer: Buffer,
    originalFileName: string,
    userId: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `Starting reconversion and XFDF merge for document: ${documentId}`,
      )

      const document = await this.#_prisma.document.findFirst({
        where: {
          id: documentId,
          deletedAt: null,
        },
        select: {
          xfdfUrl: true,
          createdById: true,
        },
      })

      if (!document) {
        this.logger.warn(`Document not found: ${documentId}`)
        return
      }

      // Convert DOCX to PDF
      this.logger.log('Converting updated DOCX to PDF')
      const { pdfBuffer, fileName: pdfFileName } =
        await PdfConverterUtil.convertDocxToPdf(docxBuffer, originalFileName)

      let finalPdfBuffer = pdfBuffer
      let finalPdfFileName = pdfFileName

      // If XFDF exists, merge it with the new PDF
      if (document.xfdfUrl) {
        this.logger.log('XFDF found, merging with new PDF')
        const xfdfBuffer = Buffer.from(document.xfdfUrl, 'utf-8')

        const { pdfBuffer: mergedPdfBuffer, fileName: mergedFileName } =
          await PdfConverterUtil.mergeXfdfToPdf(
            pdfBuffer,
            xfdfBuffer,
            pdfFileName,
          )

        finalPdfBuffer = mergedPdfBuffer
        finalPdfFileName = mergedFileName
        this.logger.log('XFDF merged successfully with new PDF')
      }

      // Versiya aniqlash — shu document'dagi auto-generated PDF lar soni
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
      const cleanPdfName = finalPdfFileName
        .replace(/^\d+-/g, '')
        .replace(/^(merged-)+/g, '')
        .replace(/\s*\(v\d+\)/g, '') // eski versiya raqamini olib tashlash
      const ext = cleanPdfName.substring(cleanPdfName.lastIndexOf('.'))
      const nameWithoutExt = cleanPdfName.substring(
        0,
        cleanPdfName.lastIndexOf('.'),
      )
      const versionedName = `${nameWithoutExt} (v${version})${ext}`

      const sanitizedPdfFileName = this.#_minio.sanitizeFileName(versionedName)
      const uploadedPdfFileName = `attachments/${Date.now()}-${sanitizedPdfFileName}`
      await this.#_minio.putFile(
        uploadedPdfFileName,
        finalPdfBuffer,
        'application/pdf',
      )

      const pdfUrl = this.#_minio.buildFileUrl(uploadedPdfFileName)
      this.logger.log(`New PDF uploaded to MinIO: ${pdfUrl} [${versionedName}]`)

      await this.#_prisma.attachment.create({
        data: {
          fileName: versionedName,
          fileUrl: pdfUrl,
          fileSize: finalPdfBuffer.length,
          mimeType: 'application/pdf',
          documentId,
          uploadedById: userId,
          isAutoGenerated: true,
        },
      })

      // Update document with new PDF URL
      await this.#_prisma.document.update({
        where: {
          id: documentId,
        },
        data: {
          pdfUrl: pdfUrl,
          updatedAt: new Date(),
        },
      })

      this.logger.log(
        `Document updated with new PDF URL after DOCX update: ${pdfUrl}`,
      )
    } catch (error) {
      this.logger.error(
        `Error reconverting and merging XFDF for document ${documentId}: ${error.message}`,
      )
      this.logger.error(`Error stack: ${error.stack}`)
      // Don't throw error to prevent WOPI save from failing
    }
  }

  private async getFileById(fileId: string): Promise<{
    id: string
    fileName: string
    fileSize: number
    fileUrl: string
    mimeType: string
    uploadedById: string | null
    documentId: string | null
    updatedAt: Date
  }> {
    const attachment = await this.#_prisma.attachment.findFirst({
      where: {
        id: fileId,
        deletedAt: null,
      },
      select: {
        id: true,
        fileName: true,
        fileSize: true,
        fileUrl: true,
        mimeType: true,
        uploadedById: true,
        documentId: true,
        updatedAt: true,
      },
    })

    if (!attachment) {
      throw new NotFoundException("Fayl topilmadi")
    }

    return attachment
  }

  private async verifyUserAccess(userId: string): Promise<void> {
    const user = await this.#_prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
        isActive: true,
      },
    })

    if (!user) {
      throw new NotFoundException("Foydalanuvchi topilmadi yoki faol emas")
    }
  }

  private extractFileNameFromUrl(fileUrl: string): string {
    const url = new URL(fileUrl)
    // Remove the bucket name from the path
    const path = url.pathname.split('/').slice(2).join('/')
    return path
  }
}
