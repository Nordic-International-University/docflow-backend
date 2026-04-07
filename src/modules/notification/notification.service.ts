import { Injectable, NotFoundException, Logger, forwardRef, Inject } from '@nestjs/common'
import { PrismaService } from '@prisma'
import { NotificationGateway } from './notification.gateway'
import { TelegramService } from '../telegram/telegram.service'
import {
  CreateNotificationDto,
  NotificationResponseDto,
  NotificationListResponseDto,
  NotificationType,
} from './dtos'
import { translateActionTypeToUzbek, formatDateToUzbek } from '@common'

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationGateway: NotificationGateway,
    @Inject(forwardRef(() => TelegramService))
    private readonly telegramService: TelegramService,
  ) {}

  async createNotification(
    data: CreateNotificationDto,
  ): Promise<NotificationResponseDto> {
    // Save notification to database
    const notification = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata || {},
        isRead: false,
      },
    })

    // Real-time WebSocket
    await this.notificationGateway.sendNotificationToUser(
      data.userId,
      this.mapToResponseDto(notification),
    )

    // Telegram bildirishnomasi
    try {
      const telegramMessage =
        `<b>${data.title}</b>\n\n${data.message}`
      await this.telegramService.sendWorkflowNotification(data.userId, telegramMessage)
    } catch (err) {
      this.logger.warn(`Telegram notification failed for user ${data.userId}: ${err.message}`)
    }

    this.logger.log(
      `Created notification for user ${data.userId}: ${data.title}`,
    )

    return this.mapToResponseDto(notification)
  }

  // Workflow Step Assigned Notification
  async createWorkflowStepAssignedNotification(
    userId: string,
    workflowStepId: string,
    workflowStep: any,
  ): Promise<NotificationResponseDto> {
    console.log('workflowStep', workflowStep)
    const documentNumber =
      workflowStep.workflow?.document?.documentNumber || "Noma'lum raqam"
    const actionTypeUz = translateActionTypeToUzbek(workflowStep.actionType)
    const deadline = formatDateToUzbek(workflowStep.dueDate)

    return this.createNotification({
      userId,
      type: NotificationType.WORKFLOW_STEP_ASSIGNED,
      title: 'Yangi Ish Oqimi Bosqichi Tayinlandi',
      message: `${documentNumber} raqamli hujjat uchun sizga ${actionTypeUz} bosqichi tayinlandi. Muddat: ${deadline}`,
      metadata: {
        workflowStepId,
        workflowId: workflowStep.workflowId,
        documentId: workflowStep.workflow?.documentId,
        actionType: workflowStep.actionType,
        order: workflowStep.order,
      },
    })
  }

  // Workflow Step Completed Notification
  async createWorkflowStepCompletedNotification(
    userId: string,
    workflowStepId: string,
    completedByUserId: string,
  ): Promise<NotificationResponseDto> {
    const workflowStep = await this.prisma.workflowStep.findFirst({
      where: { id: workflowStepId },
      include: {
        workflow: {
          include: { document: true },
        },
      },
    })

    if (!workflowStep) {
      this.logger.warn(
        `Workflow step ${workflowStepId} not found for completed notification`,
      )
      return null
    }

    const user = await this.prisma.user.findFirst({
      where: { id: completedByUserId },
      select: { fullname: true, username: true },
    })

    const completedBy = user?.fullname || user?.username || 'Foydalanuvchi'
    const documentNumber =
      workflowStep.workflow?.document?.documentNumber || "Noma'lum raqam"

    return this.createNotification({
      userId,
      type: NotificationType.WORKFLOW_STEP_COMPLETED,
      title: 'Ish Oqimi Bosqichi Bajarildi',
      message: `${completedBy} ${documentNumber} raqamli hujjat uchun ish oqimi bosqichini bajarib bo'ldi`,
      metadata: {
        workflowStepId,
        workflowId: workflowStep.workflowId,
        documentId: workflowStep.workflow?.documentId,
        completedBy: completedByUserId,
        actionType: workflowStep.actionType,
      },
    })
  }

  // Workflow Step Rejected Notification
  async createWorkflowStepRejectedNotification(
    userId: string,
    workflowStepId: string,
    rejectedByUserId: string,
    rejectionReason: string,
  ): Promise<NotificationResponseDto> {
    const workflowStep = await this.prisma.workflowStep.findFirst({
      where: { id: workflowStepId },
      include: {
        workflow: {
          include: { document: true },
        },
      },
    })

    if (!workflowStep) {
      this.logger.warn(
        `Workflow step ${workflowStepId} not found for rejected notification`,
      )
      return null
    }

    const user = await this.prisma.user.findFirst({
      where: { id: rejectedByUserId },
      select: { fullname: true, username: true },
    })

    const rejectedBy = user?.fullname || user?.username || 'Foydalanuvchi'
    const documentNumber =
      workflowStep.workflow?.document?.documentNumber || "Noma'lum raqam"

    return this.createNotification({
      userId,
      type: NotificationType.WORKFLOW_STEP_REJECTED,
      title: 'Ish Oqimi Bosqichi Rad Etildi',
      message: `${rejectedBy} ${documentNumber} raqamli hujjat uchun ish oqimi bosqichini rad etdi`,
      metadata: {
        workflowStepId,
        workflowId: workflowStep.workflowId,
        documentId: workflowStep.workflow?.documentId,
        rejectedBy: rejectedByUserId,
        rejectionReason,
        actionType: workflowStep.actionType,
      },
    })
  }

  // Workflow Step Reassigned Notification
  async createWorkflowStepReassignedNotification(
    newAssignedUserId: string,
    previousAssignedUserId: string,
    workflowStepId: string,
    reassignedByUserId: string,
  ): Promise<NotificationResponseDto> {
    const workflowStep = await this.prisma.workflowStep.findFirst({
      where: { id: workflowStepId },
      include: {
        workflow: {
          include: { document: true },
        },
      },
    })

    if (!workflowStep) {
      this.logger.warn(
        `Workflow step ${workflowStepId} not found for reassigned notification`,
      )
      return null
    }

    const user = await this.prisma.user.findFirst({
      where: { id: reassignedByUserId },
      select: { fullname: true, username: true },
    })

    const reassignedBy =
      user?.fullname || user?.username || 'Ish oqimi yaratuvchisi'
    const documentNumber =
      workflowStep.workflow?.document?.documentNumber || "Noma'lum raqam"
    const actionTypeUz = translateActionTypeToUzbek(workflowStep.actionType)
    const deadline = formatDateToUzbek(workflowStep.dueDate)

    return this.createNotification({
      userId: newAssignedUserId,
      type: NotificationType.WORKFLOW_STEP_REASSIGNED,
      title: 'Ish Oqimi Bosqichi Qayta Tayinlandi',
      message: `${reassignedBy} ${documentNumber} raqamli hujjat uchun ${actionTypeUz} bosqichini sizga qayta tayinladi. Muddat: ${deadline}`,
      metadata: {
        workflowStepId,
        workflowId: workflowStep.workflowId,
        documentId: workflowStep.workflow?.documentId,
        reassignedBy: reassignedByUserId,
        previousAssignedUserId,
        actionType: workflowStep.actionType,
      },
    })
  }

  // Workflow Completed Notification
  async createWorkflowCompletedNotification(
    userId: string,
    workflowId: string,
  ): Promise<NotificationResponseDto> {
    const workflow = await this.prisma.workflow.findFirst({
      where: { id: workflowId },
      include: { document: true },
    })

    if (!workflow) {
      this.logger.warn(`Workflow ${workflowId} not found for notification`)
      return null
    }

    const documentNumber = workflow.document?.documentNumber || "Noma'lum raqam"

    return this.createNotification({
      userId,
      type: NotificationType.WORKFLOW_COMPLETED,
      title: 'Ish Oqimi Yakunlandi',
      message: `${documentNumber} raqamli hujjat uchun ish oqimi yakunlandi`,
      metadata: {
        workflowId,
        documentId: workflow.documentId,
      },
    })
  }

  // Workflow Step Comment Notification
  async createWorkflowStepCommentNotification(
    userId: string,
    workflowStepId: string,
    commentedByUserId: string,
    comment: string,
  ): Promise<NotificationResponseDto> {
    const workflowStep = await this.prisma.workflowStep.findFirst({
      where: { id: workflowStepId },
      include: {
        workflow: {
          include: { document: true },
        },
      },
    })

    if (!workflowStep) {
      this.logger.warn(
        `Workflow step ${workflowStepId} not found for comment notification`,
      )
      return null
    }

    const user = await this.prisma.user.findFirst({
      where: { id: commentedByUserId },
      select: { fullname: true, username: true },
    })

    const commentedBy = user?.fullname || user?.username || 'Foydalanuvchi'
    const documentNumber =
      workflowStep.workflow?.document?.documentNumber || "Noma'lum raqam"

    return this.createNotification({
      userId,
      type: NotificationType.WORKFLOW_STEP_COMMENT,
      title: 'Ish Oqimi Bosqichiga Yangi Izoh',
      message: `${commentedBy} ${documentNumber} raqamli hujjat uchun ish oqimi bosqichiga izoh qoldirdi`,
      metadata: {
        workflowStepId,
        workflowId: workflowStep.workflowId,
        documentId: workflowStep.workflow?.documentId,
        commentedBy: commentedByUserId,
        comment,
      },
    })
  }

  // Task Assigned Notification
  async createTaskAssignedNotification(params: {
    userId: string
    assignedById: string
    taskId: string
    taskTitle: string
    taskNumber: number
    projectKey: string
    projectId: string
    score?: number
  }): Promise<NotificationResponseDto | null> {
    const assignedBy = await this.prisma.user.findFirst({
      where: { id: params.assignedById },
      select: { fullname: true, username: true },
    })

    const assignerName =
      assignedBy?.fullname || assignedBy?.username || 'Foydalanuvchi'
    const taskRef = `${params.projectKey}-${params.taskNumber}`
    const scoreText = params.score != null ? ` (${params.score} ball)` : ''

    return this.createNotification({
      userId: params.userId,
      type: NotificationType.TASK_ASSIGNED,
      title: 'Yangi vazifa biriktirildi',
      message: `${assignerName} sizga "${params.taskTitle}" vazifasini biriktirdi — ${taskRef}${scoreText}`,
      metadata: {
        taskId: params.taskId,
        taskNumber: params.taskNumber,
        projectId: params.projectId,
        projectKey: params.projectKey,
        assignedBy: params.assignedById,
      },
    })
  }

  // Get notifications for a user
  async getNotifications(
    userId: string,
    isRead?: boolean,
    limit = 50,
  ): Promise<NotificationListResponseDto> {
    const [notifications, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: {
          userId,
          ...(isRead !== undefined && { isRead }),
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      }),
      this.prisma.notification.count({
        where: {
          userId,
          isRead: false,
          deletedAt: null,
        },
      }),
    ])

    return {
      data: notifications.map((n) => this.mapToResponseDto(n)),
      count: notifications.length,
      unreadCount,
    }
  }

  // Get unread count
  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
        deletedAt: null,
      },
    })
  }

  // Mark as read
  async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<NotificationResponseDto> {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
        deletedAt: null,
      },
    })

    if (!notification) {
      throw new NotFoundException('Notification not found')
    }

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return this.mapToResponseDto(updated)
  }

  // Mark all as read
  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
        deletedAt: null,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return { count: result.count }
  }

  // Delete notification
  async deleteNotification(
    notificationId: string,
    userId: string,
  ): Promise<{ message: string }> {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
        deletedAt: null,
      },
    })

    if (!notification) {
      throw new NotFoundException('Notification not found')
    }

    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { deletedAt: new Date() },
    })

    return { message: 'Notification deleted successfully' }
  }

  // Helper to map to response DTO
  private mapToResponseDto(notification: any): NotificationResponseDto {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      metadata: notification.metadata,
      isRead: notification.isRead,
      readAt: notification.readAt?.toISOString(),
      createdAt: notification.createdAt.toISOString(),
      updatedAt: notification.updatedAt.toISOString(),
    }
  }
}
