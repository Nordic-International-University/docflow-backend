import { ROLE_NAMES } from '@constants'
import { Injectable, ForbiddenException, Logger } from '@nestjs/common'
import { PrismaService } from '@prisma'
import { StepActionType } from '@prisma/client'
import { STEP_ACTION_WOPI_PERMISSIONS } from '@constants'

export interface WorkflowPermissions {
  UserCanWrite: boolean
  UserCanRead: boolean
  ReadOnly: boolean
  WebEditingDisabled: boolean
  actionType?: StepActionType
  workflowStepId?: string
}

@Injectable()
export class WorkflowPermissionService {
  private readonly logger = new Logger(WorkflowPermissionService.name)
  readonly #_prisma: PrismaService

  constructor(prisma: PrismaService) {
    this.#_prisma = prisma
  }

  async getUserPermissionsForFile(
    userId: string,
    fileId: string,
  ): Promise<WorkflowPermissions> {
    const currentUser = await this.#_prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { role: { select: { name: true } } },
    })
    const isSuperAdmin = currentUser?.role?.name === ROLE_NAMES.SUPER_ADMIN

    const attachment = await this.#_prisma.attachment.findFirst({
      where: { id: fileId, deletedAt: null },
      select: {
        documentId: true,
        uploadedById: true,
        mimeType: true,
        fileName: true,
      },
    })

    if (!attachment || !attachment.documentId) {
      this.logger.log(`No document — granting full access`)
      return {
        UserCanWrite: true,
        UserCanRead: true,
        ReadOnly: false,
        WebEditingDisabled: false,
      }
    }

    const document = await this.#_prisma.document.findFirst({
      where: { id: attachment.documentId, deletedAt: null },
      select: { status: true, createdById: true },
    })
    if (!document) {
      return {
        UserCanWrite: false,
        UserCanRead: false,
        ReadOnly: true,
        WebEditingDisabled: true,
      }
    }

    // Office fayl turi (DOCX/XLSX/PPTX)
    const isOfficeFile = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint',
    ].includes(attachment.mimeType)

    // ============ APPROVED/ARCHIVED — hamma uchun READ-ONLY ============
    if (document.status === 'APPROVED' || document.status === 'ARCHIVED') {
      this.logger.log(
        `Document ${attachment.documentId} is ${document.status}, READ-ONLY`,
      )
      return {
        UserCanWrite: false,
        UserCanRead: true,
        ReadOnly: true,
        WebEditingDisabled: true,
      }
    }

    // ============ DRAFT — faqat creator DOCX edit qila oladi ============
    if (document.status === 'DRAFT' || document.status === 'REJECTED') {
      // Faqat creator yoki Super Admin
      if (document.createdById === userId || isSuperAdmin) {
        return {
          UserCanWrite: true,
          UserCanRead: true,
          ReadOnly: false,
          WebEditingDisabled: false,
        }
      }
      return {
        UserCanWrite: false,
        UserCanRead: true,
        ReadOnly: true,
        WebEditingDisabled: true,
      }
    }

    // ============ PENDING / IN_REVIEW (workflow active) ============
    // OFFICE FAYL — hech kim edit qila olmaydi (workflow boshlandi, qotirildi)
    if (isOfficeFile) {
      this.logger.log(
        `Document ${attachment.documentId} workflow active — DOCX is LOCKED`,
      )
      return {
        UserCanWrite: false,
        UserCanRead: true,
        ReadOnly: true,
        WebEditingDisabled: true,
      }
    }

    // PDF fayl — faqat workflow step bo'yicha edit qilinishi mumkin (XFDF orqali)
    // Lekin Collabora orqali emas — faqat XFDF endpoint orqali
    // Shuning uchun PDF ham Collabora'da read-only

    // Workflow COMPLETED — read-only
    const completedWorkflow = await this.#_prisma.workflow.findFirst({
      where: {
        documentId: attachment.documentId,
        status: 'COMPLETED',
        deletedAt: null,
      },
    })
    if (completedWorkflow) {
      return {
        UserCanWrite: false,
        UserCanRead: true,
        ReadOnly: true,
        WebEditingDisabled: true,
      }
    }

    // Super Admin — read-only ham (workflow active'da Super Admin ham edit qilmasligi kerak)
    if (isSuperAdmin) {
      this.logger.log(
        `Super Admin viewing active workflow document — read-only`,
      )
      return {
        UserCanWrite: false,
        UserCanRead: true,
        ReadOnly: true,
        WebEditingDisabled: true,
      }
    }

    // File owner — workflow active'da ham edit qila olmaydi
    if (attachment.uploadedById === userId) {
      this.logger.log(`File owner during active workflow — read-only`)
      return {
        UserCanWrite: false,
        UserCanRead: true,
        ReadOnly: true,
        WebEditingDisabled: true,
      }
    }

    // Workflow active va user assigned step'ga ega — read-only Collabora'da
    // (XFDF orqali alohida endpoint orqali edit qilishi mumkin)
    return {
      UserCanWrite: false,
      UserCanRead: true,
      ReadOnly: true,
      WebEditingDisabled: true,
    }
  }

  async verifyWritePermission(userId: string, fileId: string): Promise<void> {
    const permissions = await this.getUserPermissionsForFile(userId, fileId)

    if (!permissions.UserCanWrite) {
      throw new ForbiddenException(
        `You do not have permission to edit this document. Your current workflow step (${permissions.actionType || 'none'}) does not allow editing.`,
      )
    }
  }

  /**
   * Verify that a user has read permission for a file
   * Throws ForbiddenException if user cannot read
   */
  async verifyReadPermission(userId: string, fileId: string): Promise<void> {
    const permissions = await this.getUserPermissionsForFile(userId, fileId)

    if (!permissions.UserCanRead) {
      throw new ForbiddenException(
        'You do not have permission to access this document.',
      )
    }
  }

  /**
   * Check if user has XFDF editing permission
   * Returns true if user is the document creator or has an active workflow step
   * All action types (APPROVAL, SIGN, REVIEW, ACKNOWLEDGE, VERIFICATION) can edit XFDF
   */
  async hasXfdfEditPermissionForDocument(
    userId: string,
    documentId: string,
  ): Promise<boolean> {
    // Check if user is Super Admin — always has permission
    const user = await this.#_prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { role: { select: { name: true } } },
    })
    if (user?.role?.name === ROLE_NAMES.SUPER_ADMIN) {
      this.logger.log(
        `User ${userId} is Super Administrator, granting XFDF edit permission`,
      )
      return true
    }

    // Check if the user is the document creator - they always have permission
    const document = await this.#_prisma.document.findFirst({
      where: {
        id: documentId,
        deletedAt: null,
      },
      select: {
        createdById: true,
      },
    })

    if (!document) {
      this.logger.warn(`Document ${documentId} not found`)
      return false
    }

    if (document.createdById === userId) {
      this.logger.log(
        `User ${userId} is the creator of document ${documentId}, granting XFDF edit permission`,
      )
      return true
    }

    // Check if workflow is completed - deny XFDF operations on completed workflows
    const completedWorkflow = await this.#_prisma.workflow.findFirst({
      where: {
        documentId: documentId,
        status: 'COMPLETED',
        deletedAt: null,
      },
    })

    if (completedWorkflow) {
      this.logger.warn(
        `Workflow for document ${documentId} is completed, denying XFDF editing`,
      )
      return false
    }

    // Find active workflow for this document
    const workflow = await this.#_prisma.workflow.findFirst({
      where: {
        documentId: documentId,
        status: 'ACTIVE',
        deletedAt: null,
      },
      include: {
        workflowSteps: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    // If no active workflow, deny XFDF editing
    if (!workflow) {
      this.logger.warn(
        `No active workflow for document ${documentId}, denying XFDF editing`,
      )
      return false
    }

    // Find the user's current workflow step
    const userWorkflowStep = workflow.workflowSteps.find(
      (step) =>
        step.assignedToUserId === userId &&
        (step.status === 'IN_PROGRESS' || step.status === 'NOT_STARTED'),
    )

    if (!userWorkflowStep) {
      this.logger.warn(
        `User ${userId} has no active workflow step for document ${documentId}`,
      )
      return false
    }

    // All action types can edit XFDF
    const hasPermission = true

    this.logger.log(
      `User ${userId} has XFDF edit permission for document ${documentId} (action type: ${userWorkflowStep.actionType})`,
    )

    return hasPermission
  }

  /**
   * Verify that a user has XFDF editing permission
   * Throws ForbiddenException if user does not have an active workflow step
   */
  async verifyXfdfEditPermission(
    userId: string,
    documentId: string,
  ): Promise<void> {
    const hasPermission = await this.hasXfdfEditPermissionForDocument(
      userId,
      documentId,
    )

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to edit XFDF annotations. Only users with an active workflow step can perform this action.',
      )
    }
  }

  /**
   * @deprecated Use hasXfdfEditPermissionForDocument instead
   * Check if user has SIGN action type for XFDF editing on a document
   */
  async hasSignPermissionForDocument(
    userId: string,
    documentId: string,
  ): Promise<boolean> {
    return this.hasXfdfEditPermissionForDocument(userId, documentId)
  }

  /**
   * @deprecated Use verifyXfdfEditPermission instead
   * Verify that a user has SIGN permission for XFDF editing
   */
  async verifySignPermission(
    userId: string,
    documentId: string,
  ): Promise<void> {
    return this.verifyXfdfEditPermission(userId, documentId)
  }
}
