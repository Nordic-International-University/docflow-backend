import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '@prisma'
import {
  WorkflowStepCreateDto,
  WorkflowStepUpdateDto,
  WorkflowStepDeleteDto,
  WorkflowStepRetrieveAllDto,
  WorkflowStepListResponseDto,
  WorkflowStepResponseDto,
  WorkflowStepActionType,
  WorkflowStepActionResponseDto,
  WorkflowStepActionListResponseDto,
  WorkflowStepApproveDto,
  WorkflowStepRejectDto,
  WorkflowStepVerifyDto,
  WorkflowStepCalendarDto,
  WorkflowStepCalendarListResponseDto,
  WorkflowStepCalendarResponseDto,
} from './dtos'
import { DocumentStatus, WorkflowStatus } from '@prisma/client'
import { NotificationService } from '../notification/notification.service'
import { NotificationGateway } from '../notification/notification.gateway'
import { TelegramService } from '../telegram/telegram.service'
import { MinioService } from '@clients'
import { AuditLogService } from '../audit-log/audit-log.service'
import { AuditAction } from '../audit-log/interfaces/audit-log-enums'
import { translateActionTypeToUzbek, formatDateToUzbek } from '@common'
import { isAdmin } from '@common/helpers'
import { accessibleBy } from '@casl/prisma'
import type { AppAbility } from '../../casl/casl.types'

@Injectable()
export class WorkflowStepService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
    private readonly telegramService: TelegramService,
    private readonly minioService: MinioService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async workflowStepRetrieveAll(
    payload: WorkflowStepRetrieveAllDto & {
      userId?: string
      roleName?: string
      ability?: AppAbility
    },
  ): Promise<WorkflowStepListResponseDto> {
    const {
      workflowId,
      assignedToUserId,
      status,
      pageNumber = 1,
      pageSize = 10,
      userId,
      roleName,
    } = payload

    const skip = (pageNumber - 1) * pageSize

    // ABAC: ability borsa CASL, yo'qsa eski manual filter
    const abilityFilter = payload.ability
      ? accessibleBy(payload.ability, 'read').WorkflowStep
      : !isAdmin(roleName) && userId
        ? { assignedToUserId: userId }
        : {}

    const where = {
      ...(workflowId && { workflowId }),
      ...(assignedToUserId && { assignedToUserId }),
      ...(status && { status }),
      deletedAt: null,
      ...abilityFilter,
    }

    const [workflowSteps, total] = await Promise.all([
      this.prisma.workflowStep.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { order: 'asc' },
        include: {
          workflow: {
            include: {
              document: true,
            },
          },
          actions: {
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
            include: {
              performedBy: {
                select: {
                  id: true,
                  fullname: true,
                  username: true,
                  avatarUrl: true,
                },
              },
            },
          },
          attachments: {
            include: {
              attachment: true,
              uploadedBy: {
                select: {
                  id: true,
                  fullname: true,
                  username: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.workflowStep.count({ where }),
    ])

    return {
      data: workflowSteps.map((step) => this.mapToResponseDto(step)),
      pageCount: Math.ceil(total / pageSize),
      pageNumber,
      pageSize,
      count: total,
    }
  }

  async workflowStepRetrieveOne(payload: {
    id: string
    userId?: string
    roleName?: string
    ability?: AppAbility
  }): Promise<WorkflowStepResponseDto> {
    // ABAC: ability borsa CASL, yo'qsa eski manual filter
    const abilityFilter = payload.ability
      ? accessibleBy(payload.ability, 'read').WorkflowStep
      : !isAdmin(payload.roleName) && payload.userId
        ? { assignedToUserId: payload.userId }
        : {}

    const workflowStep = await this.prisma.workflowStep.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
        ...abilityFilter,
      },
      include: {
        workflow: {
          include: {
            document: true,
          },
        },
        actions: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          include: {
            performedBy: {
              select: {
                id: true,
                fullname: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
        attachments: {
          include: {
            attachment: true,
            uploadedBy: {
              select: {
                id: true,
                fullname: true,
                username: true,
              },
            },
          },
        },
      },
    })

    if (!workflowStep) {
      throw new NotFoundException('Workflow step not found')
    }

    return this.mapToResponseDto(workflowStep)
  }

  async workflowStepCreate(
    payload: WorkflowStepCreateDto,
    userId?: string,
  ): Promise<WorkflowStepResponseDto> {
    // Verify workflow exists
    const workflow = await this.prisma.workflow.findFirst({
      where: {
        id: payload.workflowId,
        deletedAt: null,
      },
      include: {
        document: {
          select: {
            createdById: true,
          },
        },
      },
    })

    if (!workflow) {
      throw new NotFoundException('Workflow not found')
    }

    // Check if workflow is already completed (immutable)
    if (workflow.status === WorkflowStatus.COMPLETED) {
      throw new BadRequestException(
        'This workflow has been completed and cannot be modified',
      )
    }

    // Check if only workflow creator can add steps (document creator)
    if (userId && workflow.document.createdById !== userId) {
      throw new BadRequestException(
        'Only the workflow creator can add workflow steps',
      )
    }

    // Verify assigned user exists if provided
    if (payload.assignedToUserId) {
      const user = await this.prisma.user.findFirst({
        where: {
          id: payload.assignedToUserId,
          deletedAt: null,
        },
      })

      if (!user) {
        throw new NotFoundException('Assigned user not found')
      }
    }

    // Check for duplicate order in the same workflow
    const existingStep = await this.prisma.workflowStep.findFirst({
      where: {
        workflowId: payload.workflowId,
        order: payload.order,
        deletedAt: null,
      },
    })

    if (existingStep) {
      throw new BadRequestException(
        'A step with this order already exists in the workflow',
      )
    }

    const workflowStep = await this.prisma.workflowStep.create({
      data: {
        order: payload.order,
        status: payload.status || 'NOT_STARTED',
        actionType: payload.actionType,
        workflowId: payload.workflowId,
        assignedToUserId: payload.assignedToUserId,
        startedAt: payload.startedAt ? new Date(payload.startedAt) : null,
        completedAt: payload.completedAt ? new Date(payload.completedAt) : null,
        dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
        isRejected: payload.isRejected || false,
        rejectionReason: payload.rejectionReason,
        rejectedAt: payload.rejectedAt ? new Date(payload.rejectedAt) : null,
      },
      include: {
        workflow: {
          include: {
            document: true,
          },
        },
      },
    })

    return this.mapToResponseDto(workflowStep)
  }

  async workflowStepUpdate(
    payload: WorkflowStepUpdateDto & { id: string; userId?: string },
  ): Promise<WorkflowStepResponseDto> {
    const { id, userId, ...updateData } = payload

    // Verify workflow step exists
    const existingStep = await this.prisma.workflowStep.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        workflow: {
          include: {
            document: {
              select: {
                createdById: true,
              },
            },
          },
        },
      },
    })

    if (!existingStep) {
      throw new NotFoundException('Workflow step not found')
    }

    // Check if workflow is already completed (immutable)
    if (existingStep.workflow.status === WorkflowStatus.COMPLETED) {
      throw new BadRequestException(
        'This workflow has been completed and cannot be modified',
      )
    }

    // Check if only workflow creator can update (document creator)
    if (userId && existingStep.workflow.document.createdById !== userId) {
      throw new BadRequestException(
        'Only the workflow creator can update workflow steps',
      )
    }

    // Verify assigned user exists if provided
    if (updateData.assignedToUserId) {
      const user = await this.prisma.user.findFirst({
        where: {
          id: updateData.assignedToUserId,
          deletedAt: null,
        },
      })

      if (!user) {
        throw new NotFoundException('Assigned user not found')
      }
    }

    // Check for duplicate order if order is being updated
    if (updateData.order && updateData.order !== existingStep.order) {
      const duplicateStep = await this.prisma.workflowStep.findFirst({
        where: {
          workflowId: existingStep.workflowId,
          order: updateData.order,
          id: { not: id },
          deletedAt: null,
        },
      })

      if (duplicateStep) {
        throw new BadRequestException(
          'A step with this order already exists in the workflow',
        )
      }
    }

    const workflowStep = await this.prisma.workflowStep.update({
      where: { id },
      data: {
        ...updateData,
        startedAt: updateData.startedAt
          ? new Date(updateData.startedAt)
          : undefined,
        completedAt: updateData.completedAt
          ? new Date(updateData.completedAt)
          : undefined,
        dueDate: updateData.dueDate ? new Date(updateData.dueDate) : undefined,
        rejectedAt: updateData.rejectedAt
          ? new Date(updateData.rejectedAt)
          : undefined,
      },
      include: {
        workflow: {
          include: {
            document: true,
          },
        },
      },
    })

    return this.mapToResponseDto(workflowStep)
  }

  async workflowStepDelete(
    payload: WorkflowStepDeleteDto & { userId?: string },
  ): Promise<{ message: string }> {
    const workflowStep = await this.prisma.workflowStep.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
      include: {
        workflow: {
          include: {
            document: {
              select: {
                createdById: true,
              },
            },
          },
        },
      },
    })

    if (!workflowStep) {
      throw new NotFoundException('Workflow step not found')
    }

    // Check if workflow is already completed (immutable)
    if (workflowStep.workflow.status === WorkflowStatus.COMPLETED) {
      throw new BadRequestException(
        'This workflow has been completed and cannot be modified',
      )
    }

    // Check if only workflow creator can delete (document creator)
    if (
      payload.userId &&
      workflowStep.workflow.document.createdById !== payload.userId
    ) {
      throw new BadRequestException(
        'Only the workflow creator can delete workflow steps',
      )
    }

    await this.prisma.workflowStep.update({
      where: { id: payload.id },
      data: { deletedAt: new Date() },
    })

    return { message: 'Workflow step deleted successfully' }
  }

  async getStepsByWorkflow(payload: {
    workflowId: string
    userId?: string
  }): Promise<WorkflowStepListResponseDto> {
    const workflow = await this.prisma.workflow.findFirst({
      where: {
        id: payload.workflowId,
        deletedAt: null,
      },
    })

    if (!workflow) {
      throw new NotFoundException('Workflow not found')
    }

    const workflowSteps = await this.prisma.workflowStep.findMany({
      where: {
        workflowId: payload.workflowId,
        deletedAt: null,
        // Filter by user access: only show steps assigned to the user
        ...(payload.userId && { assignedToUserId: payload.userId }),
      },
      orderBy: { order: 'asc' },
      include: {
        workflow: {
          include: {
            document: true,
          },
        },
        actions: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          include: {
            performedBy: {
              select: {
                id: true,
                fullname: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
        attachments: {
          include: {
            attachment: true,
            uploadedBy: {
              select: {
                id: true,
                fullname: true,
                username: true,
              },
            },
          },
        },
      },
    })

    return {
      data: workflowSteps.map((step) => this.mapToResponseDto(step)),
      pageCount: Math.ceil(workflowSteps.length / workflowSteps.length),
      pageNumber: 1,
      pageSize: workflowSteps.length,
      count: workflowSteps.length,
    }
  }

  async assignStepToUser(payload: {
    id: string
    assignedToUserId: string
    assignedByUserId?: string
  }): Promise<WorkflowStepResponseDto> {
    const workflowStep = await this.prisma.workflowStep.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
      include: {
        workflow: {
          include: {
            document: {
              select: {
                createdById: true,
              },
            },
          },
        },
      },
    })

    if (!workflowStep) {
      throw new NotFoundException('Workflow step not found')
    }

    // Check if workflow is already completed (immutable)
    if (workflowStep.workflow.status === WorkflowStatus.COMPLETED) {
      throw new BadRequestException(
        'This workflow has been completed and cannot be modified',
      )
    }

    // Block reassignment of VERIFICATION steps
    if (workflowStep.actionType === 'VERIFICATION') {
      throw new BadRequestException(
        'VERIFICATION type workflow steps cannot be reassigned. They must be completed by the originally assigned user.',
      )
    }

    // Check if only workflow creator can reassign (document creator)
    if (
      payload.assignedByUserId &&
      workflowStep.workflow.document.createdById !== payload.assignedByUserId
    ) {
      throw new BadRequestException(
        'Only the workflow creator can reassign workflow steps',
      )
    }

    // Verify user exists
    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.assignedToUserId,
        deletedAt: null,
      },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    const previousAssignedUserId = workflowStep.assignedToUserId

    // Update the step and record the assignment action in a transaction
    const updatedStep = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.workflowStep.update({
        where: { id: payload.id },
        data: {
          assignedToUserId: payload.assignedToUserId,
          status: 'IN_PROGRESS',
          startedAt: workflowStep.startedAt || new Date(),
        },
        include: {
          workflow: {
            include: {
              document: true,
            },
          },
        },
      })

      // Update document status to IN_REVIEW when workflow step starts
      if (updated.workflow.document.status === DocumentStatus.PENDING) {
        await tx.document.update({
          where: { id: updated.workflow.document.id },
          data: { status: DocumentStatus.IN_REVIEW },
        })
      }

      // Record the reassignment action if there's a user to record it
      if (payload.assignedByUserId) {
        await tx.workflowStepAction.create({
          data: {
            workflowStepId: payload.id,
            actionType: 'REASSIGNED',
            performedByUserId: payload.assignedByUserId,
            metadata: {
              previousAssignedUserId,
              newAssignedUserId: payload.assignedToUserId,
            },
          },
        })
      }

      return updated
    })

    // Send notification to assigned user
    if (previousAssignedUserId !== payload.assignedToUserId) {
      // This is a reassignment
      await this.notificationService.createWorkflowStepReassignedNotification(
        payload.assignedToUserId,
        previousAssignedUserId,
        payload.id,
        payload.assignedByUserId,
      )

      // Send Telegram notification
      await this.telegramService.sendWorkflowNotification(
        payload.assignedToUserId,
        `🔄 <b>Ish Jarayoni Qadami Qayta Tayinlandi</b>\n\n` +
          `Sizga ish jarayoni qadami qayta tayinlandi.\n` +
          `Qadam: ${updatedStep.order}\n` +
          `Turi: ${updatedStep.actionType}`,
        payload.id,
      )
    } else {
      // This is a new assignment
      await this.notificationService.createWorkflowStepAssignedNotification(
        payload.assignedToUserId,
        payload.id,
        updatedStep,
      )

      // Send Telegram notification
      await this.telegramService.sendWorkflowNotification(
        payload.assignedToUserId,
        `📋 <b>Yangi Ish Jarayoni Qadami Tayinlandi</b>\n\n` +
          `Sizga yangi ish jarayoni qadami tayinlandi.\n` +
          `Qadam: ${updatedStep.order}\n` +
          `Turi: ${updatedStep.actionType}`,
        payload.id,
      )
    }

    // Update workflow count for the assigned user
    await this.notificationGateway.notifyWorkflowCountUpdate(
      payload.assignedToUserId,
    )

    // If reassigned, update count for previous user too
    if (
      previousAssignedUserId &&
      previousAssignedUserId !== payload.assignedToUserId
    ) {
      await this.notificationGateway.notifyWorkflowCountUpdate(
        previousAssignedUserId,
      )
    }

    return this.mapToResponseDto(updatedStep)
  }

  async completeStep(payload: {
    id: string
    userId: string
    comment?: string
  }): Promise<WorkflowStepResponseDto> {
    const workflowStep = await this.prisma.workflowStep.findFirst({
      where: {
        id: payload.id,
        assignedToUserId: payload.userId,
        deletedAt: null,
      },
      include: {
        workflow: {
          include: {
            document: {
              select: {
                createdById: true,
                xfdfUrl: true,
              },
            },
          },
        },
      },
    })

    if (!workflowStep) {
      throw new NotFoundException('Workflow step not found')
    }

    // Check if workflow is already completed (immutable)
    if (workflowStep.workflow.status === WorkflowStatus.COMPLETED) {
      throw new BadRequestException(
        'This workflow has been completed and cannot be modified',
      )
    }

    // Validate that this step is the current step in the workflow (only for CONSECUTIVE workflows)
    if (
      workflowStep.workflow.type === 'CONSECUTIVE' &&
      workflowStep.order !== workflowStep.workflow.currentStepOrder
    ) {
      throw new BadRequestException(
        `Cannot complete this step. Current workflow step is ${workflowStep.workflow.currentStepOrder}, but you are trying to complete step ${workflowStep.order}. Steps must be completed in order.`,
      )
    }

    // Check if the step is already completed
    if (workflowStep.status === WorkflowStatus.COMPLETED) {
      throw new BadRequestException('This step has already been completed')
    }

    // Validate XFDF submission for APPROVAL and SIGN action types
    if (
      workflowStep.actionType === 'APPROVAL' ||
      workflowStep.actionType === 'SIGN'
    ) {
      // Check if this specific user has submitted their XFDF
      const xfdfSubmissionAction =
        await this.prisma.workflowStepAction.findFirst({
          where: {
            workflowStepId: payload.id,
            performedByUserId: payload.userId,
            metadata: {
              path: ['xfdfSubmitted'],
              equals: true,
            },
            deletedAt: null,
          },
        })

      if (!xfdfSubmissionAction) {
        throw new BadRequestException(
          `Cannot complete ${workflowStep.actionType.toLowerCase()} step. You must submit XFDF annotations before completing this step.`,
        )
      }
    }

    // Complete the step and advance the workflow in a transaction
    const transactionResult = await this.prisma.$transaction(async (tx) => {
      // Complete the current step
      await tx.workflowStep.update({
        where: { id: payload.id },
        data: {
          status: WorkflowStatus.COMPLETED,
          completedAt: new Date(),
          isRejected: false,
          rejectionReason: null,
          rejectedAt: null,
        },
      })

      // Record the approval action
      await tx.workflowStepAction.create({
        data: {
          workflowStepId: payload.id,
          actionType: 'APPROVED',
          performedByUserId: payload.userId,
          comment: payload.comment,
        },
      })

      // Store next step info for notification outside transaction
      let nextStepForNotification: any = null

      // Handle workflow advancement based on type
      if (workflowStep.workflow.type === 'CONSECUTIVE') {
        // CONSECUTIVE: Find the next step in order (excluding creator steps)
        // For creator step (order -1), find the first regular step instead of order 0
        let nextStep
        if (workflowStep.isCreator || workflowStep.order < 0) {
          // Find the first non-creator step (minimum order >= 0)
          nextStep = await tx.workflowStep.findFirst({
            where: {
              workflowId: workflowStep.workflowId,
              order: { gte: 0 },
              isCreator: { not: true },
              deletedAt: null,
            },
            orderBy: { order: 'asc' },
          })
        } else {
          const nextStepOrder = workflowStep.order + 1
          nextStep = await tx.workflowStep.findFirst({
            where: {
              workflowId: workflowStep.workflowId,
              order: nextStepOrder,
              isCreator: { not: true },
              deletedAt: null,
            },
          })
        }

        if (nextStep) {
          // Update the next step to IN_PROGRESS
          await tx.workflowStep.update({
            where: { id: nextStep.id },
            data: {
              status: 'IN_PROGRESS',
              startedAt: new Date(),
            },
          })

          // Record the started action for the next step
          await tx.workflowStepAction.create({
            data: {
              workflowStepId: nextStep.id,
              actionType: 'STARTED',
              performedByUserId: payload.userId,
            },
          })

          // Update workflow's current step order to the next step's actual order
          await tx.workflow.update({
            where: { id: workflowStep.workflowId },
            data: {
              currentStepOrder: nextStep.order,
            },
          })

          // Ensure document status is IN_REVIEW when next step starts
          await tx.document.update({
            where: { id: workflowStep.workflow.documentId },
            data: { status: DocumentStatus.IN_REVIEW },
          })

          // Fetch the next step with full relations for notification
          nextStepForNotification = await tx.workflowStep.findFirst({
            where: { id: nextStep.id },
            include: {
              workflow: {
                include: {
                  document: true,
                },
              },
            },
          })
        } else {
          // No more steps, mark workflow as COMPLETED
          await tx.workflow.update({
            where: { id: workflowStep.workflowId },
            data: {
              status: WorkflowStatus.COMPLETED,
            },
          })

          // Update document status to APPROVED when workflow is completed
          await tx.document.update({
            where: { id: workflowStep.workflow.documentId },
            data: { status: DocumentStatus.APPROVED },
          })
        }
      } else if (workflowStep.workflow.type === 'PARALLEL') {
        // PARALLEL: Check if all steps are completed
        const allSteps = await tx.workflowStep.findMany({
          where: {
            workflowId: workflowStep.workflowId,
            deletedAt: null,
          },
          select: {
            id: true,
            status: true,
          },
        })

        // Check if all steps are now completed
        const allCompleted = allSteps.every(
          (step) => step.status === WorkflowStatus.COMPLETED,
        )

        if (allCompleted) {
          // All steps completed, mark workflow as COMPLETED
          await tx.workflow.update({
            where: { id: workflowStep.workflowId },
            data: {
              status: WorkflowStatus.COMPLETED,
            },
          })

          // Update document status to APPROVED when workflow is completed
          await tx.document.update({
            where: { id: workflowStep.workflow.documentId },
            data: { status: DocumentStatus.APPROVED },
          })
        }
      }

      // Return the completed step with full relations
      const completedStepResult = await tx.workflowStep.findFirst({
        where: { id: payload.id },
        include: {
          workflow: {
            include: {
              document: true,
            },
          },
        },
      })

      return {
        completedStep: completedStepResult,
        nextStep: nextStepForNotification,
      }
    })

    // Extract results from transaction
    const updatedStep = transactionResult.completedStep
    const nextStepWithRelations = transactionResult.nextStep

    // Send notification to next step's assigned user if there is one
    if (nextStepWithRelations?.assignedToUserId) {
      await this.notificationService.createWorkflowStepAssignedNotification(
        nextStepWithRelations.assignedToUserId,
        nextStepWithRelations.id,
        nextStepWithRelations,
      )

      // Update workflow count for the next step's assigned user
      await this.notificationGateway.notifyWorkflowCountUpdate(
        nextStepWithRelations.assignedToUserId,
      )

      // Send Telegram notification to next step user
      const documentNumber =
        nextStepWithRelations.workflow?.document?.documentNumber ||
        "Noma'lum raqam"
      const actionTypeUz = translateActionTypeToUzbek(
        nextStepWithRelations.actionType,
      )
      const deadline = formatDateToUzbek(nextStepWithRelations.dueDate)
      await this.telegramService.sendWorkflowNotification(
        nextStepWithRelations.assignedToUserId,
        `📋 <b>Yangi Ish Jarayoni Bosqichi</b>\n\n` +
          `Sizga yangi ish jarayoni bosqichi tayinlandi.\n` +
          `Bosqich turi: ${actionTypeUz}\n` +
          `Hujjat: ${documentNumber} raqamli hujjat\n` +
          `⏰ Muddat: ${deadline}`,
        nextStepWithRelations.id,
      )
    }

    // Send notification to document creator about completion
    if (workflowStep.workflow.document.createdById !== payload.userId) {
      await this.notificationService.createWorkflowStepCompletedNotification(
        workflowStep.workflow.document.createdById,
        payload.id,
        payload.userId,
      )

      // Send Telegram notification
      await this.telegramService.sendWorkflowNotification(
        workflowStep.workflow.document.createdById,
        `✅ <b>Ish Jarayoni Qadami Bajarildi</b>\n\n` +
          `${workflowStep.order}-qadam bajarildi.\n` +
          `Hujjat: ${updatedStep.workflow.document.title || 'Nomsiz'}`,
        payload.id,
      )
    }

    // If workflow is completed, notify document creator
    if (updatedStep.workflow.status === WorkflowStatus.COMPLETED) {
      await this.notificationService.createWorkflowCompletedNotification(
        workflowStep.workflow.document.createdById,
        workflowStep.workflowId,
      )

      // Send Telegram notification
      await this.telegramService.sendWorkflowNotification(
        workflowStep.workflow.document.createdById,
        `🎉 <b>Ish Jarayoni Tugallandi!</b>\n\n` +
          `Barcha ish jarayoni qadamlari bajarildi.\n` +
          `Hujjat: ${updatedStep.workflow.document.title || 'Nomsiz'}`,
        workflowStep.workflowId,
      )
    }

    // Update workflow count for the user who completed the step
    await this.notificationGateway.notifyWorkflowCountUpdate(payload.userId)

    return this.mapToResponseDto(updatedStep)
  }

  async rejectStep(payload: {
    id: string
    rejectionReason: string
    userId?: string
    comment?: string
    rollbackToUserId?: string
    rejectToCreator?: boolean
  }): Promise<WorkflowStepResponseDto> {
    const workflowStep = await this.prisma.workflowStep.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
        // Filter by user access: only allow rejecting steps assigned to the user
        ...(payload.userId && { assignedToUserId: payload.userId }),
      },
      include: {
        workflow: {
          include: {
            document: {
              select: {
                createdById: true,
              },
            },
          },
        },
      },
    })

    if (!workflowStep) {
      throw new NotFoundException('Workflow step not found')
    }

    if (!payload.userId) {
      throw new BadRequestException('User ID is required to reject a step')
    }

    // Check if workflow is already completed (immutable)
    if (workflowStep.workflow.status === WorkflowStatus.COMPLETED) {
      throw new BadRequestException(
        'This workflow has been completed and cannot be modified',
      )
    }

    // Block rejection of VERIFICATION steps
    if (workflowStep.actionType === 'VERIFICATION') {
      throw new BadRequestException(
        'VERIFICATION type workflow steps cannot be rejected or rolled back. They can only be completed with file attachments.',
      )
    }

    // Validate that this step is the current step in the workflow (only for CONSECUTIVE workflows)
    if (
      workflowStep.workflow.type === 'CONSECUTIVE' &&
      workflowStep.order !== workflowStep.workflow.currentStepOrder
    ) {
      throw new BadRequestException(
        `Cannot reject this step. Current workflow step is ${workflowStep.workflow.currentStepOrder}, but you are trying to reject step ${workflowStep.order}. Steps must be processed in order.`,
      )
    }

    // Handle rejection to creator
    let rollbackStep = null
    if (payload.rejectToCreator) {
      // Find the creator step (isCreator: true)
      rollbackStep = await this.prisma.workflowStep.findFirst({
        where: {
          workflowId: workflowStep.workflowId,
          isCreator: true,
          deletedAt: null,
        },
      })

      if (!rollbackStep) {
        throw new NotFoundException(
          'Creator step not found in this workflow. Unable to reject to creator.',
        )
      }
    } else if (payload.rollbackToUserId) {
      // Rollback only works for CONSECUTIVE workflows
      if (workflowStep.workflow.type !== 'CONSECUTIVE') {
        throw new BadRequestException(
          'Rollback feature is only available for CONSECUTIVE workflows',
        )
      }

      // Verify the rollback user exists
      const rollbackUser = await this.prisma.user.findFirst({
        where: {
          id: payload.rollbackToUserId,
          deletedAt: null,
        },
      })

      if (!rollbackUser) {
        throw new NotFoundException('Rollback user not found')
      }

      // Find the previous step assigned to this user in the same workflow
      rollbackStep = await this.prisma.workflowStep.findFirst({
        where: {
          workflowId: workflowStep.workflowId,
          assignedToUserId: payload.rollbackToUserId,
          order: {
            lt: workflowStep.order, // Must be before current step
          },
          deletedAt: null,
        },
        orderBy: {
          order: 'desc', // Get the most recent step assigned to this user
        },
      })

      if (!rollbackStep) {
        throw new NotFoundException(
          `No previous workflow step found for user ${rollbackUser.fullname || rollbackUser.username} in this workflow`,
        )
      }
    }

    // Update the step and record the rejection action in a transaction
    const updatedStep = await this.prisma.$transaction(async (tx) => {
      // Update the workflow step
      const updated = await tx.workflowStep.update({
        where: { id: payload.id },
        data: {
          status: 'REJECTED',
          isRejected: true,
          rejectionReason: payload.rejectionReason,
          rejectedAt: new Date(),
          completedAt: new Date(),
        },
        include: {
          workflow: {
            include: {
              document: true,
            },
          },
        },
      })

      // Record the rejection action
      await tx.workflowStepAction.create({
        data: {
          workflowStepId: payload.id,
          actionType: 'REJECTED',
          performedByUserId: payload.userId,
          comment: payload.comment || payload.rejectionReason,
          metadata: {
            rejectionReason: payload.rejectionReason,
            ...(payload.rollbackToUserId && {
              rollbackToUserId: payload.rollbackToUserId,
              rollbackToStepId: rollbackStep?.id,
              rollbackToStepOrder: rollbackStep?.order,
            }),
          },
        },
      })

      // Handle rollback if specified
      if (rollbackStep) {
        // Reset the rollback step to IN_PROGRESS for re-review
        await tx.workflowStep.update({
          where: { id: rollbackStep.id },
          data: {
            status: 'IN_PROGRESS',
            startedAt: new Date(),
            completedAt: null,
            isRejected: false,
            rejectionReason: null,
            rejectedAt: null,
          },
        })

        // Record the rollback action
        await tx.workflowStepAction.create({
          data: {
            workflowStepId: rollbackStep.id,
            actionType: 'STARTED',
            performedByUserId: payload.userId,
            comment: `Rolled back for re-review due to rejection at step ${workflowStep.order}`,
            metadata: {
              rolledBackFromStepId: payload.id,
              rolledBackFromStepOrder: workflowStep.order,
              rollbackRequestedByUserId: payload.userId,
            },
          },
        })

        // Update workflow's current step order to the rollback step
        await tx.workflow.update({
          where: { id: workflowStep.workflowId },
          data: {
            currentStepOrder: rollbackStep.order,
          },
        })

        // Reset all steps between rollback step and current step (exclusive)
        await tx.workflowStep.updateMany({
          where: {
            workflowId: workflowStep.workflowId,
            order: {
              gt: rollbackStep.order,
              lt: workflowStep.order,
            },
            deletedAt: null,
          },
          data: {
            status: 'NOT_STARTED',
            startedAt: null,
            completedAt: null,
            isRejected: false,
            rejectionReason: null,
            rejectedAt: null,
          },
        })
      } else {
        // No rollback specified - set document status to REJECTED
        await tx.document.update({
          where: { id: workflowStep.workflow.documentId },
          data: { status: DocumentStatus.REJECTED },
        })
      }

      return updated
    })

    // Send notification to document creator about rejection
    if (workflowStep.workflow.document.createdById !== payload.userId) {
      await this.notificationService.createWorkflowStepRejectedNotification(
        workflowStep.workflow.document.createdById,
        payload.id,
        payload.userId,
        payload.rejectionReason,
      )

      // Send Telegram notification
      await this.telegramService.sendWorkflowNotification(
        workflowStep.workflow.document.createdById,
        `❌ <b>Ish Jarayoni Qadami Rad Etildi</b>\n\n` +
          `${workflowStep.order}-qadam rad etildi.\n` +
          `Hujjat: ${updatedStep.workflow.document.title || 'Nomsiz'}\n` +
          `Sabab: ${payload.rejectionReason}`,
        payload.id,
      )
    }

    // If there was a rollback, notify the rollback user
    if (
      payload.rollbackToUserId &&
      payload.rollbackToUserId !== payload.userId
    ) {
      await this.notificationService.createWorkflowStepAssignedNotification(
        payload.rollbackToUserId,
        updatedStep.id,
        updatedStep,
      )

      // Send Telegram notification
      await this.telegramService.sendWorkflowNotification(
        payload.rollbackToUserId,
        `🔙 <b>Ish Jarayoni Qaytarildi</b>\n\n` +
          `Ish jarayoni sizga qayta ko'rib chiqish uchun qaytarildi.\n` +
          `Qadam: ${rollbackStep?.order}\n` +
          `Sabab: ${payload.rejectionReason}`,
        rollbackStep?.id,
      )
    }

    // Update workflow count for the user who rejected
    await this.notificationGateway.notifyWorkflowCountUpdate(payload.userId)

    // If rollback user exists, update their count too
    if (payload.rollbackToUserId) {
      await this.notificationGateway.notifyWorkflowCountUpdate(
        payload.rollbackToUserId,
      )
    }

    return this.mapToResponseDto(updatedStep)
  }

  async getWorkflowStepActions(payload: {
    workflowStepId: string
    pageNumber?: number
    pageSize?: number
  }): Promise<WorkflowStepActionListResponseDto> {
    const { workflowStepId, pageNumber = 1, pageSize = 10 } = payload

    // Verify workflow step exists
    const workflowStep = await this.prisma.workflowStep.findFirst({
      where: {
        id: workflowStepId,
        deletedAt: null,
      },
    })

    if (!workflowStep) {
      throw new NotFoundException('Workflow step not found')
    }

    const skip = (pageNumber - 1) * pageSize

    const [actions, total] = await Promise.all([
      this.prisma.workflowStepAction.findMany({
        where: {
          workflowStepId,
          deletedAt: null,
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          performedBy: {
            select: {
              id: true,
              fullname: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.workflowStepAction.count({
        where: {
          workflowStepId,
          deletedAt: null,
        },
      }),
    ])

    return {
      data: actions.map((action) => this.mapToActionResponseDto(action)),
      pageCount: Math.ceil(total / pageSize),
      pageNumber,
      pageSize,
      count: total,
    }
  }

  async getWorkflowActions(payload: {
    workflowId: string
    pageNumber?: number
    pageSize?: number
  }): Promise<WorkflowStepActionListResponseDto> {
    const { workflowId, pageNumber = 1, pageSize = 50 } = payload

    const workflow = await this.prisma.workflow.findFirst({
      where: {
        id: workflowId,
        deletedAt: null,
      },
    })

    if (!workflow) {
      throw new NotFoundException('Workflow not found')
    }

    const skip = (pageNumber - 1) * pageSize

    const [actions, total] = await Promise.all([
      this.prisma.workflowStepAction.findMany({
        where: {
          workflowStep: {
            workflowId,
            deletedAt: null,
          },
          deletedAt: null,
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          performedBy: {
            select: {
              id: true,
              fullname: true,
              username: true,
              avatarUrl: true,
            },
          },
          workflowStep: {
            select: {
              id: true,
              order: true,
              status: true,
              actionType: true,
            },
          },
        },
      }),
      this.prisma.workflowStepAction.count({
        where: {
          workflowStep: {
            workflowId,
            deletedAt: null,
          },
          deletedAt: null,
        },
      }),
    ])

    return {
      data: actions.map((action) => this.mapToActionResponseDto(action)),
      pageCount: Math.ceil(total / pageSize),
      pageNumber,
      pageSize,
      count: total,
    }
  }

  async addWorkflowStepComment(payload: {
    workflowStepId: string
    userId: string
    comment: string
  }): Promise<WorkflowStepActionResponseDto> {
    const workflowStep = await this.prisma.workflowStep.findFirst({
      where: {
        id: payload.workflowStepId,
        deletedAt: null,
      },
    })

    if (!workflowStep) {
      throw new NotFoundException('Workflow step not found')
    }

    const action = await this.prisma.workflowStepAction.create({
      data: {
        workflowStepId: payload.workflowStepId,
        actionType: 'COMMENTED',
        performedByUserId: payload.userId,
        comment: payload.comment,
      },
      include: {
        performedBy: {
          select: {
            id: true,
            fullname: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    })

    // Send notification to assigned user if they didn't make the comment
    if (
      workflowStep.assignedToUserId &&
      workflowStep.assignedToUserId !== payload.userId
    ) {
      await this.notificationService.createWorkflowStepCommentNotification(
        workflowStep.assignedToUserId,
        payload.workflowStepId,
        payload.userId,
        payload.comment,
      )
    }

    return this.mapToActionResponseDto(action)
  }

  async getCalendarView(
    payload: WorkflowStepCalendarDto & { userId: string },
  ): Promise<WorkflowStepCalendarListResponseDto> {
    const { startDate, endDate, status, userId } = payload

    // Set default date range if not provided (current month)
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const end = endDate
      ? new Date(endDate)
      : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)

    // Fetch workflow steps assigned to the user within the date range
    const workflowSteps = await this.prisma.workflowStep.findMany({
      where: {
        assignedToUserId: userId,
        deletedAt: null,
        dueDate: {
          gte: start,
          lte: end,
        },
        ...(status && { status }),
      },
      orderBy: [{ dueDate: 'asc' }, { order: 'asc' }],
      include: {
        workflow: {
          include: {
            document: {
              select: {
                id: true,
                title: true,
                documentNumber: true,
                status: true,
              },
            },
          },
        },
      },
    })

    // Group workflow steps by date
    const groupedByDate = workflowSteps.reduce(
      (acc, step) => {
        if (step.dueDate) {
          const dateKey = step.dueDate.toISOString().split('T')[0] // YYYY-MM-DD format
          if (!acc[dateKey]) {
            acc[dateKey] = []
          }
          acc[dateKey].push(step)
        }
        return acc
      },
      {} as Record<string, typeof workflowSteps>,
    )

    // Transform to response format
    const data: WorkflowStepCalendarResponseDto[] = Object.entries(
      groupedByDate,
    )
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, steps]) => ({
        date,
        workflowSteps: steps.map((step) => ({
          id: step.id,
          order: step.order,
          status: step.status,
          actionType: step.actionType,
          workflowId: step.workflowId,
          assignedToUserId: step.assignedToUserId,
          dueDate: step.dueDate?.toISOString(),
          isRejected: step.isRejected,
          workflow: step.workflow,
          createdAt: step.createdAt.toISOString(),
          updatedAt: step.updatedAt.toISOString(),
        })),
        count: steps.length,
      }))

    return {
      data,
      totalCount: workflowSteps.length,
      daysWithSteps: data.length,
    }
  }

  private mapToActionResponseDto(action: any): WorkflowStepActionResponseDto {
    return {
      id: action.id,
      workflowStepId: action.workflowStepId,
      actionType: action.actionType,
      performedByUserId: action.performedByUserId,
      performedBy: action.performedBy,
      workflowStep: action.workflowStep,
      comment: action.comment,
      metadata: action.metadata,
      createdAt: action.createdAt.toISOString(),
      updatedAt: action.updatedAt.toISOString(),
    }
  }

  private mapToResponseDto(workflowStep: any): any {
    return {
      id: workflowStep.id,
      order: workflowStep.order,
      status: workflowStep.status,
      actionType: workflowStep.actionType,
      workflowId: workflowStep.workflowId,
      workflow: workflowStep.workflow,
      assignedToUserId: workflowStep.assignedToUserId,
      startedAt: workflowStep.startedAt?.toISOString(),
      completedAt: workflowStep.completedAt?.toISOString(),
      dueDate: workflowStep.dueDate?.toISOString(),
      isRejected: workflowStep.isRejected,
      rejectionReason: workflowStep.rejectionReason,
      rejectedAt: workflowStep.rejectedAt?.toISOString(),
      actions: workflowStep.actions
        ? workflowStep.actions.map((action: any) =>
            this.mapToActionResponseDto(action),
          )
        : [],
      attachments: workflowStep.attachments
        ? workflowStep.attachments.map((att: any) => ({
            id: att.id,
            workflowStepId: att.workflowStepId,
            attachmentId: att.attachmentId,
            comment: att.comment,
            uploadedByUserId: att.uploadedByUserId,
            uploadedBy: att.uploadedBy
              ? {
                  id: att.uploadedBy.id,
                  fullname: att.uploadedBy.fullname,
                  username: att.uploadedBy.username,
                }
              : null,
            attachment: att.attachment
              ? {
                  id: att.attachment.id,
                  fileName: att.attachment.fileName,
                  fileUrl: att.attachment.fileUrl,
                  fileSize: att.attachment.fileSize,
                  mimeType: att.attachment.mimeType,
                }
              : null,
            createdAt: att.createdAt?.toISOString(),
            updatedAt: att.updatedAt?.toISOString(),
          }))
        : [],
      createdAt: workflowStep.createdAt.toISOString(),
      updatedAt: workflowStep.updatedAt.toISOString(),
    }
  }

  /**
   * Verifies a VERIFICATION type workflow step by uploading files and completing the step.
   * This method is specifically for VERIFICATION steps which require file attachments as proof of work.
   * Unlike regular steps, VERIFICATION steps cannot be rejected or rolled back.
   */
  async verifyStep(payload: {
    id: string
    userId: string
    files: Express.Multer.File[]
    comment?: string
  }): Promise<WorkflowStepResponseDto> {
    // Validate that at least one file is provided
    if (!payload.files || payload.files.length === 0) {
      throw new BadRequestException(
        'At least one file attachment is required for verification steps',
      )
    }

    // Fetch the workflow step
    const workflowStep = await this.prisma.workflowStep.findFirst({
      where: {
        id: payload.id,
        assignedToUserId: payload.userId,
        deletedAt: null,
      },
      include: {
        workflow: {
          include: {
            document: {
              select: {
                createdById: true,
              },
            },
          },
        },
      },
    })

    if (!workflowStep) {
      throw new NotFoundException('Workflow step not found')
    }

    // Verify this is a VERIFICATION type step
    if (workflowStep.actionType !== 'VERIFICATION') {
      throw new BadRequestException(
        'This endpoint is only for VERIFICATION type workflow steps',
      )
    }

    // Check if workflow is already completed (immutable)
    if (workflowStep.workflow.status === WorkflowStatus.COMPLETED) {
      throw new BadRequestException(
        'This workflow has been completed and cannot be modified',
      )
    }

    // Validate that this step is the current step in the workflow (only for CONSECUTIVE workflows)
    if (
      workflowStep.workflow.type === 'CONSECUTIVE' &&
      workflowStep.order !== workflowStep.workflow.currentStepOrder
    ) {
      throw new BadRequestException(
        `Cannot complete this step. Current workflow step is ${workflowStep.workflow.currentStepOrder}, but you are trying to complete step ${workflowStep.order}. Steps must be completed in order.`,
      )
    }

    // Check if the step is already completed
    if (workflowStep.status === WorkflowStatus.COMPLETED) {
      throw new BadRequestException('This step has already been completed')
    }

    // Helper function to decode filename
    const decodeFileName = (originalName: string): string => {
      try {
        return decodeURIComponent(originalName)
      } catch {
        try {
          const bytes = Buffer.from(originalName, 'latin1')
          return bytes.toString('utf8')
        } catch {
          return originalName
        }
      }
    }

    // Upload files and complete the step in a transaction
    const transactionResult = await this.prisma.$transaction(async (tx) => {
      // Upload all files and create attachment records
      const attachmentIds: string[] = []

      for (const file of payload.files) {
        // Upload file to MinIO
        const uploadedFileName = await this.minioService.uploadFile(
          file,
          'verification-attachments/',
        )

        const fileUrl = this.minioService.buildFileUrl(uploadedFileName)
        const decodedFileName = decodeFileName(file.originalname)

        // Create attachment record
        const attachment = await tx.attachment.create({
          data: {
            fileName: decodedFileName,
            fileUrl: fileUrl,
            fileSize: file.size,
            mimeType: file.mimetype,
            uploadedById: payload.userId,
          },
        })

        attachmentIds.push(attachment.id)

        // Link attachment to workflow step
        await tx.workflowStepAttachment.create({
          data: {
            workflowStepId: payload.id,
            attachmentId: attachment.id,
            uploadedByUserId: payload.userId,
            comment: payload.comment,
          },
        })
      }

      // Complete the current step
      await tx.workflowStep.update({
        where: { id: payload.id },
        data: {
          status: WorkflowStatus.COMPLETED,
          completedAt: new Date(),
          isRejected: false,
          rejectionReason: null,
          rejectedAt: null,
        },
      })

      // Record the approval action
      await tx.workflowStepAction.create({
        data: {
          workflowStepId: payload.id,
          actionType: 'APPROVED',
          performedByUserId: payload.userId,
          comment: payload.comment,
          metadata: {
            verificationType: 'FILE_UPLOAD',
            attachmentCount: payload.files.length,
            attachmentIds: attachmentIds,
          },
        },
      })

      // Store next step info for notification outside transaction
      let nextStepForNotification: any = null

      // Handle workflow advancement based on type
      if (workflowStep.workflow.type === 'CONSECUTIVE') {
        // CONSECUTIVE: Find the next step in order (excluding creator steps)
        // For creator step (order -1), find the first regular step instead of order 0
        let nextStep
        if (workflowStep.isCreator || workflowStep.order < 0) {
          // Find the first non-creator step (minimum order >= 0)
          nextStep = await tx.workflowStep.findFirst({
            where: {
              workflowId: workflowStep.workflowId,
              order: { gte: 0 },
              isCreator: { not: true },
              deletedAt: null,
            },
            orderBy: { order: 'asc' },
          })
        } else {
          const nextStepOrder = workflowStep.order + 1
          nextStep = await tx.workflowStep.findFirst({
            where: {
              workflowId: workflowStep.workflowId,
              order: nextStepOrder,
              isCreator: { not: true },
              deletedAt: null,
            },
          })
        }

        if (nextStep) {
          // Update the next step to IN_PROGRESS
          await tx.workflowStep.update({
            where: { id: nextStep.id },
            data: {
              status: 'IN_PROGRESS',
              startedAt: new Date(),
            },
          })

          // Record the started action for the next step
          await tx.workflowStepAction.create({
            data: {
              workflowStepId: nextStep.id,
              actionType: 'STARTED',
              performedByUserId: payload.userId,
            },
          })

          // Update workflow's current step order to the next step's actual order
          await tx.workflow.update({
            where: { id: workflowStep.workflowId },
            data: {
              currentStepOrder: nextStep.order,
            },
          })

          // Ensure document status is IN_REVIEW when next step starts
          await tx.document.update({
            where: { id: workflowStep.workflow.documentId },
            data: { status: DocumentStatus.IN_REVIEW },
          })

          // Fetch the next step with full relations for notification
          nextStepForNotification = await tx.workflowStep.findFirst({
            where: { id: nextStep.id },
            include: {
              workflow: {
                include: {
                  document: true,
                },
              },
            },
          })
        } else {
          // No more steps, mark workflow as COMPLETED
          await tx.workflow.update({
            where: { id: workflowStep.workflowId },
            data: {
              status: WorkflowStatus.COMPLETED,
            },
          })

          // Update document status to APPROVED when workflow is completed
          await tx.document.update({
            where: { id: workflowStep.workflow.documentId },
            data: { status: DocumentStatus.APPROVED },
          })
        }
      } else if (workflowStep.workflow.type === 'PARALLEL') {
        // PARALLEL: Check if all steps are completed
        const allSteps = await tx.workflowStep.findMany({
          where: {
            workflowId: workflowStep.workflowId,
            deletedAt: null,
          },
          select: {
            id: true,
            status: true,
          },
        })

        // Check if all steps are now completed
        const allCompleted = allSteps.every(
          (step) => step.status === WorkflowStatus.COMPLETED,
        )

        if (allCompleted) {
          // All steps completed, mark workflow as COMPLETED
          await tx.workflow.update({
            where: { id: workflowStep.workflowId },
            data: {
              status: WorkflowStatus.COMPLETED,
            },
          })

          // Update document status to APPROVED when workflow is completed
          await tx.document.update({
            where: { id: workflowStep.workflow.documentId },
            data: { status: DocumentStatus.APPROVED },
          })
        }
      }

      // Return the updated step and next step
      const completedStepResult = await tx.workflowStep.findFirst({
        where: { id: payload.id },
        include: {
          workflow: {
            include: {
              document: true,
            },
          },
          assignedToUser: {
            select: {
              id: true,
              fullname: true,
              username: true,
              avatarUrl: true,
            },
          },
          actions: {
            include: {
              performedBy: {
                select: {
                  id: true,
                  fullname: true,
                  username: true,
                  avatarUrl: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          attachments: {
            include: {
              attachment: true,
              uploadedBy: {
                select: {
                  id: true,
                  fullname: true,
                  username: true,
                },
              },
            },
          },
        },
      })

      return {
        completedStep: completedStepResult,
        nextStep: nextStepForNotification,
      }
    })

    // Extract results from transaction
    const updatedStep = transactionResult.completedStep
    const nextStepWithRelations = transactionResult.nextStep

    // Send notification to next step's assigned user if there is one
    if (nextStepWithRelations?.assignedToUserId) {
      await this.notificationService.createWorkflowStepAssignedNotification(
        nextStepWithRelations.assignedToUserId,
        nextStepWithRelations.id,
        nextStepWithRelations,
      )

      // Update workflow count for the next step's assigned user
      await this.notificationGateway.notifyWorkflowCountUpdate(
        nextStepWithRelations.assignedToUserId,
      )

      // Send Telegram notification to next step user
      const documentNumber =
        nextStepWithRelations.workflow?.document?.documentNumber ||
        "Noma'lum raqam"
      const actionTypeUz = translateActionTypeToUzbek(
        nextStepWithRelations.actionType,
      )
      const deadline = formatDateToUzbek(nextStepWithRelations.dueDate)
      await this.telegramService.sendWorkflowNotification(
        nextStepWithRelations.assignedToUserId,
        `📋 <b>Yangi Ish Jarayoni Bosqichi</b>\n\n` +
          `Sizga yangi ish jarayoni bosqichi tayinlandi.\n` +
          `Bosqich turi: ${actionTypeUz}\n` +
          `Hujjat: ${documentNumber} raqamli hujjat\n` +
          `⏰ Muddat: ${deadline}`,
        nextStepWithRelations.id,
      )
    }

    // Send notification to document creator about verification
    if (workflowStep.workflow.document.createdById !== payload.userId) {
      await this.notificationService.createWorkflowStepCompletedNotification(
        workflowStep.workflow.document.createdById,
        payload.id,
        payload.userId,
      )

      // Send Telegram notification
      const completedByUser = await this.prisma.user.findFirst({
        where: { id: payload.userId, deletedAt: null },
        select: { fullname: true },
      })
      await this.telegramService.sendWorkflowNotification(
        workflowStep.workflow.document.createdById,
        `✅ <b>Tekshiruv Qadami Bajarildi</b>\n\n` +
          `${workflowStep.order}-qadam tekshiruv fayllari bilan bajarildi.\n` +
          `Hujjat: ${updatedStep.workflow.document.title || 'Nomsiz'}\n` +
          `Bajaruvchi: ${completedByUser?.fullname || "Noma'lum"}\n` +
          `Fayllar: ${payload.files.length} ta`,
        payload.id,
      )
    }

    // If workflow is completed, notify document creator
    if (updatedStep.workflow.status === WorkflowStatus.COMPLETED) {
      await this.notificationService.createWorkflowCompletedNotification(
        workflowStep.workflow.document.createdById,
        workflowStep.workflowId,
      )

      // Send Telegram notification
      await this.telegramService.sendWorkflowNotification(
        workflowStep.workflow.document.createdById,
        `🎉 <b>Ish Jarayoni Tugallandi!</b>\n\n` +
          `Barcha ish jarayoni qadamlari bajarildi.\n` +
          `Hujjat: ${updatedStep.workflow.document.title || 'Nomsiz'}`,
        workflowStep.workflowId,
      )
    }

    // Update workflow count for the user who completed the verification step
    await this.notificationGateway.notifyWorkflowCountUpdate(payload.userId)

    return this.mapToResponseDto(updatedStep)
  }
}
