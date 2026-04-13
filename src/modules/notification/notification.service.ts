import {
  Injectable,
  NotFoundException,
  Logger,
  forwardRef,
  Inject,
} from '@nestjs/common'
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

    // Telegram bildirishnomasi — button bilan
    try {
      await this.sendRichTelegramNotification(data.userId, data)
    } catch (err) {
      this.logger.warn(
        `Telegram notification failed for user ${data.userId}: ${err.message}`,
      )
    }

    this.logger.log(
      `Created notification for user ${data.userId}: ${data.title}`,
    )

    return this.mapToResponseDto(notification)
  }

  /**
   * Telegram'ga to'liq formatlangan, button bilan xabar yuborish
   */
  private async sendRichTelegramNotification(
    userId: string,
    data: CreateNotificationDto,
  ): Promise<void> {
    const FRONTEND_URL = process.env.FRONTEND_URL || 'https://docverse.uz'
    const meta: Record<string, unknown> = data.metadata || {}

    // Type emoji
    const typeIcons: Record<string, string> = {
      WORKFLOW_STEP_ASSIGNED: '📋',
      WORKFLOW_STEP_COMPLETED: '✅',
      WORKFLOW_STEP_REJECTED: '❌',
      WORKFLOW_STEP_REASSIGNED: '🔄',
      WORKFLOW_COMPLETED: '🎉',
      TASK_ASSIGNED: '📌',
      TASK_COMPLETED: '✅',
      TASK_COMMENT: '💬',
      TASK_DUE_SOON: '⏰',
      DOCUMENT_STATUS: '📄',
      CHAT_MESSAGE: '💬',
      PROJECT_MEMBER: '👥',
      KPI: '📊',
      SYSTEM: '⚙️',
    }
    const icon = typeIcons[data.type] || '🔔'

    // Build action URL based on type
    let actionUrl: string | null = null
    let buttonText = "🔗 Saytda ko'rish"

    if (meta.workflowId) {
      actionUrl = `${FRONTEND_URL}/dashboard/workflow/${meta.workflowId}`
      buttonText = '📋 Ish jarayonini ochish'
    } else if (meta.documentId) {
      actionUrl = `${FRONTEND_URL}/dashboard/document/${meta.documentId}`
      buttonText = '📄 Hujjatni ochish'
    } else if (meta.taskId) {
      actionUrl = `${FRONTEND_URL}/dashboard/task/${meta.taskId}`
      buttonText = '📌 Topshiriqni ochish'
    } else if (meta.chatId) {
      actionUrl = `${FRONTEND_URL}/dashboard/chat/${meta.chatId}`
      buttonText = '💬 Chatni ochish'
    } else if (meta.projectId) {
      actionUrl = `${FRONTEND_URL}/dashboard/project/${meta.projectId}`
      buttonText = '🚀 Loyihani ochish'
    }

    // Fetch additional context
    let extraInfo = ''

    if (meta.workflowStepId) {
      const step = await this.prisma.workflowStep.findFirst({
        where: { id: meta.workflowStepId },
        include: {
          workflow: {
            include: {
              document: {
                include: {
                  documentType: { select: { name: true } },
                  createdBy: { select: { fullname: true, username: true } },
                },
              },
            },
          },
          assignedToUser: { select: { fullname: true } },
        },
      })

      if (step?.workflow?.document) {
        const doc = step.workflow.document
        extraInfo = "\n\n<b>📑 Hujjat ma'lumotlari:</b>"
        extraInfo += `\n• <b>Sarlavha:</b> ${this.escapeHtml(doc.title)}`
        extraInfo += `\n• <b>Raqam:</b> <code>${doc.documentNumber || '—'}</code>`
        if (doc.documentType?.name)
          extraInfo += `\n• <b>Turi:</b> ${doc.documentType.name}`
        if (doc.createdBy)
          extraInfo += `\n• <b>Yaratuvchi:</b> ${doc.createdBy.fullname}`
        extraInfo += `\n• <b>Bosqich tartibi:</b> ${step.order}`
        if (step.dueDate) {
          extraInfo += `\n• <b>Muddat:</b> ${formatDateToUzbek(step.dueDate)}`
        }
      }
    } else if (meta.taskId) {
      const task = await this.prisma.task.findFirst({
        where: { id: meta.taskId },
        include: {
          project: { select: { name: true, key: true } },
          createdBy: { select: { fullname: true } },
          category: { select: { name: true } },
        },
      })
      if (task) {
        extraInfo = "\n\n<b>📌 Topshiriq ma'lumotlari:</b>"
        extraInfo += `\n• <b>Nomi:</b> ${this.escapeHtml(task.title)}`
        extraInfo += `\n• <b>Loyiha:</b> ${task.project?.name || '—'}`
        if (task.project?.key)
          extraInfo += ` (<code>${task.project.key}-${task.taskNumber}</code>)`
        if (task.priority)
          extraInfo += `\n• <b>Ustuvorlik:</b> ${task.priority}`
        if (task.category?.name)
          extraInfo += `\n• <b>Kategoriya:</b> ${task.category.name}`
        if (task.createdBy)
          extraInfo += `\n• <b>Yaratuvchi:</b> ${task.createdBy.fullname}`
        if (task.dueDate)
          extraInfo += `\n• <b>Muddat:</b> ${formatDateToUzbek(task.dueDate)}`
        if (task.score) extraInfo += `\n• <b>Ball:</b> ${task.score}`
      }
    }

    // Recipient info
    const recipient = await this.prisma.user.findFirst({
      where: { id: userId },
      select: { telegramId: true, fullname: true },
    })
    if (!recipient?.telegramId) return

    // Compose message
    const now = new Date().toLocaleString('uz-UZ', {
      timeZone: 'Asia/Tashkent',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const text =
      `${icon} <b>${this.escapeHtml(data.title)}</b>\n\n` +
      `${this.escapeHtml(data.message)}` +
      extraInfo +
      `\n\n🕐 <i>${now}</i>`

    await this.telegramService.sendTelegramMessage(
      recipient.telegramId,
      text,
      actionUrl,
      buttonText,
    )
  }

  private escapeHtml(text: string): string {
    if (!text) return ''
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  // Workflow Step Assigned Notification
  async createWorkflowStepAssignedNotification(
    userId: string,
    workflowStepId: string,
    workflowStep: any,
  ): Promise<NotificationResponseDto> {
    // Always fetch full context from DB to avoid "Noma'lum raqam"
    const step = await this.prisma.workflowStep.findFirst({
      where: { id: workflowStepId },
      include: {
        workflow: {
          include: {
            document: {
              include: {
                documentType: { select: { name: true } },
                createdBy: { select: { fullname: true, username: true } },
              },
            },
          },
        },
      },
    })

    if (!step) return null

    const doc = step.workflow?.document
    const documentTitle = doc?.title || 'hujjat'
    const documentNumber = doc?.documentNumber || ''
    const documentType = doc?.documentType?.name || 'Hujjat'
    const senderName = doc?.createdBy?.fullname || 'Tizim'
    const actionTypeUz = translateActionTypeToUzbek(step.actionType)
    const deadline = formatDateToUzbek(step.dueDate)

    return this.createNotification({
      userId,
      type: NotificationType.WORKFLOW_STEP_ASSIGNED,
      title: `Yangi vazifa: ${actionTypeUz}`,
      message:
        `Hurmatli foydalanuvchi, sizga ${documentType.toLowerCase()} bo'yicha "${documentTitle}" ` +
        `${documentNumber ? `(${documentNumber})` : ''} hujjatining ${step.order}-bosqichida ` +
        `"${actionTypeUz}" amali yuklatildi. Yuboruvchi: ${senderName}. Muddat: ${deadline}.`,
      metadata: {
        workflowStepId,
        workflowId: step.workflowId,
        documentId: step.workflow?.documentId,
        actionType: step.actionType,
        order: step.order,
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
          include: {
            document: {
              include: { documentType: { select: { name: true } } },
            },
          },
        },
      },
    })

    if (!workflowStep) return null

    const user = await this.prisma.user.findFirst({
      where: { id: completedByUserId },
      select: { fullname: true, username: true },
    })

    const completedBy = user?.fullname || 'Foydalanuvchi'
    const doc = workflowStep.workflow?.document
    const documentTitle = doc?.title || 'hujjat'
    const documentNumber = doc?.documentNumber || ''
    const actionTypeUz = translateActionTypeToUzbek(workflowStep.actionType)

    return this.createNotification({
      userId,
      type: NotificationType.WORKFLOW_STEP_COMPLETED,
      title: `Bosqich bajarildi: ${actionTypeUz}`,
      message:
        `${completedBy} "${documentTitle}" ${documentNumber ? `(${documentNumber})` : ''} ` +
        `hujjatining ${workflowStep.order}-bosqichidagi "${actionTypeUz}" amalini muvaffaqiyatli yakunladi.`,
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
      include: { workflow: { include: { document: true } } },
    })
    if (!workflowStep) return null

    const user = await this.prisma.user.findFirst({
      where: { id: rejectedByUserId },
      select: { fullname: true },
    })

    const rejectedBy = user?.fullname || 'Foydalanuvchi'
    const doc = workflowStep.workflow?.document
    const documentTitle = doc?.title || 'hujjat'
    const documentNumber = doc?.documentNumber || ''
    const actionTypeUz = translateActionTypeToUzbek(workflowStep.actionType)

    return this.createNotification({
      userId,
      type: NotificationType.WORKFLOW_STEP_REJECTED,
      title: `Bosqich rad etildi: ${actionTypeUz}`,
      message:
        `Diqqat! ${rejectedBy} "${documentTitle}" ${documentNumber ? `(${documentNumber})` : ''} ` +
        `hujjatining ${workflowStep.order}-bosqichini rad etdi. Sabab: "${rejectionReason || "ko'rsatilmagan"}".`,
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

    const reassignedBy = user?.fullname || 'Ish jarayoni yaratuvchisi'
    const doc = workflowStep.workflow?.document as any
    const documentTitle = doc?.title || 'hujjat'
    const documentNumber = doc?.documentNumber || ''
    const actionTypeUz = translateActionTypeToUzbek(workflowStep.actionType)
    const deadline = formatDateToUzbek(workflowStep.dueDate)

    return this.createNotification({
      userId: newAssignedUserId,
      type: NotificationType.WORKFLOW_STEP_REASSIGNED,
      title: `Bosqich qayta tayinlandi: ${actionTypeUz}`,
      message:
        `${reassignedBy} sizga "${documentTitle}" ${documentNumber ? `(${documentNumber})` : ''} ` +
        `hujjatining ${workflowStep.order}-bosqichidagi "${actionTypeUz}" amalini qayta yukladi. Muddat: ${deadline}.`,
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
    if (!workflow) return null

    const doc = workflow.document as any
    const documentTitle = doc?.title || 'hujjat'
    const documentNumber = doc?.documentNumber || ''

    return this.createNotification({
      userId,
      type: NotificationType.WORKFLOW_COMPLETED,
      title: 'Hujjat tasdiqlandi',
      message:
        `Tabriklaymiz! "${documentTitle}" ${documentNumber ? `(${documentNumber})` : ''} ` +
        `hujjati barcha bosqichlarni muvaffaqiyatli o'tib, rasman tasdiqlandi.`,
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

    const commentedBy = user?.fullname || 'Foydalanuvchi'
    const doc = workflowStep.workflow?.document as any
    const documentTitle = doc?.title || 'hujjat'
    const documentNumber = doc?.documentNumber || ''
    const shortComment =
      comment.length > 100 ? comment.substring(0, 100) + '...' : comment

    return this.createNotification({
      userId,
      type: NotificationType.WORKFLOW_STEP_COMMENT,
      title: 'Yangi izoh',
      message:
        `${commentedBy} "${documentTitle}" ${documentNumber ? `(${documentNumber})` : ''} ` +
        `hujjati bo'yicha izoh qoldirdi: "${shortComment}"`,
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

    const assignerName = assignedBy?.fullname || 'Loyiha rahbari'
    const taskRef = `${params.projectKey}-${params.taskNumber}`
    const scoreText = params.score != null ? `, ${params.score} ball` : ''

    return this.createNotification({
      userId: params.userId,
      type: NotificationType.TASK_ASSIGNED,
      title: 'Yangi topshiriq',
      message:
        `Hurmatli foydalanuvchi, ${assignerName} sizga yangi topshiriq biriktirdi: ` +
        `"${params.taskTitle}" (${taskRef}${scoreText}). ` +
        `Iltimos, topshiriqni belgilangan muddatda bajarishingizni so'raymiz.`,
      metadata: {
        taskId: params.taskId,
        taskNumber: params.taskNumber,
        projectId: params.projectId,
        projectKey: params.projectKey,
        assignedBy: params.assignedById,
      },
    })
  }

  // ============ YANGI: Task, Document, Chat, Project notification'lari ============

  async createTaskCompletedNotification(params: {
    taskId: string
    taskTitle: string
    taskNumber: number
    projectKey: string
    completedByUserId: string
    completedByName: string
    score: number
    notifyUserIds: string[]
  }): Promise<void> {
    const taskRef = `${params.projectKey}-${params.taskNumber}`
    for (const userId of params.notifyUserIds) {
      if (userId === params.completedByUserId) continue
      await this.createNotification({
        userId,
        type: NotificationType.TASK_COMPLETED,
        title: 'Topshiriq yakunlandi',
        message: `${params.completedByName} "${params.taskTitle}" (${taskRef}) topshiriqni yakunladi. Ball: ${params.score}.`,
        metadata: { taskId: params.taskId, taskNumber: params.taskNumber, projectKey: params.projectKey },
      }).catch((err) => this.logger.warn(`Task complete notify failed: ${err.message}`))
    }
  }

  async createTaskCommentNotification(params: {
    taskId: string
    taskTitle: string
    taskNumber: number
    projectKey: string
    commentByUserId: string
    commentByName: string
    commentPreview: string
    notifyUserIds: string[]
  }): Promise<void> {
    const taskRef = `${params.projectKey}-${params.taskNumber}`
    const preview = params.commentPreview.length > 100
      ? params.commentPreview.slice(0, 100) + '...'
      : params.commentPreview
    for (const userId of params.notifyUserIds) {
      if (userId === params.commentByUserId) continue
      await this.createNotification({
        userId,
        type: NotificationType.TASK_COMMENT,
        title: 'Yangi izoh',
        message: `${params.commentByName} "${params.taskTitle}" (${taskRef}) ga izoh yozdi: "${preview}"`,
        metadata: { taskId: params.taskId, taskNumber: params.taskNumber, projectKey: params.projectKey },
      }).catch((err) => this.logger.warn(`Task comment notify failed: ${err.message}`))
    }
  }

  async createDocumentStatusChangedNotification(params: {
    documentId: string
    documentNumber: string
    documentTitle: string
    newStatus: string
    changedByName: string
    notifyUserId: string
  }): Promise<void> {
    const statusUz: Record<string, string> = {
      DRAFT: 'Qoralama',
      PENDING: 'Kutilmoqda',
      IN_REVIEW: "Ko'rib chiqilmoqda",
      APPROVED: 'Tasdiqlandi',
      REJECTED: 'Rad etildi',
      ARCHIVED: 'Arxivlandi',
    }
    await this.createNotification({
      userId: params.notifyUserId,
      type: NotificationType.DOCUMENT_STATUS,
      title: `Hujjat holati o'zgardi`,
      message: `${params.changedByName} "${params.documentTitle}" (${params.documentNumber}) hujjatini ${statusUz[params.newStatus] || params.newStatus} holatiga o'zgartirdi.`,
      metadata: { documentId: params.documentId, documentNumber: params.documentNumber, status: params.newStatus },
    }).catch((err) => this.logger.warn(`Doc status notify failed: ${err.message}`))
  }

  async createChatMessageNotification(params: {
    chatId: string
    chatTitle: string
    senderName: string
    messagePreview: string
    notifyUserId: string
  }): Promise<void> {
    const preview = params.messagePreview.length > 80
      ? params.messagePreview.slice(0, 80) + '...'
      : params.messagePreview
    await this.createNotification({
      userId: params.notifyUserId,
      type: NotificationType.CHAT_MESSAGE,
      title: `${params.senderName}`,
      message: preview,
      metadata: { chatId: params.chatId, chatTitle: params.chatTitle },
    }).catch((err) => this.logger.warn(`Chat msg notify failed: ${err.message}`))
  }

  async createProjectMemberAddedNotification(params: {
    projectId: string
    projectName: string
    addedByName: string
    notifyUserId: string
  }): Promise<void> {
    await this.createNotification({
      userId: params.notifyUserId,
      type: NotificationType.PROJECT_MEMBER,
      title: 'Loyihaga qo\'shildingiz',
      message: `${params.addedByName} sizni "${params.projectName}" loyihasiga qo'shdi.`,
      metadata: { projectId: params.projectId },
    }).catch((err) => this.logger.warn(`Project member notify failed: ${err.message}`))
  }

  async createTaskDueSoonNotification(params: {
    taskId: string
    taskTitle: string
    taskNumber: number
    projectKey: string
    dueDate: Date
    notifyUserIds: string[]
  }): Promise<void> {
    const taskRef = `${params.projectKey}-${params.taskNumber}`
    const dueDateStr = params.dueDate.toLocaleDateString('uz-UZ')
    for (const userId of params.notifyUserIds) {
      await this.createNotification({
        userId,
        type: NotificationType.TASK_DUE_SOON,
        title: 'Topshiriq muddati yaqinlashmoqda',
        message: `"${params.taskTitle}" (${taskRef}) topshiriqning muddati ${dueDateStr} da tugaydi.`,
        metadata: { taskId: params.taskId, taskNumber: params.taskNumber, projectKey: params.projectKey },
      }).catch((err) => this.logger.warn(`Task due notify failed: ${err.message}`))
    }
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
      throw new NotFoundException('Bildirishnoma topilmadi')
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
      throw new NotFoundException('Bildirishnoma topilmadi')
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
