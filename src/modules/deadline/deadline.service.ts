/**
 * Deadline Service — workflow va task deadline'larini tekshirish
 * va notification yuborish.
 *
 * @Cron dekorator bilan har N daqiqada ishlaydi.
 * User sozlamalariga qarab oldindan ogohlantiradi.
 */

import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from '@prisma'
import { NotificationService } from '../notification/notification.service'
import { NotificationType } from '../notification/dtos/notification.dto'

interface DeadlineCandidate {
  entityType: 'workflow' | 'workflow_step' | 'task'
  entityId: string
  title: string
  deadline: Date
  assigneeUserIds: string[]
  metadata: Record<string, any>
}

@Injectable()
export class DeadlineService {
  private readonly logger = new Logger(DeadlineService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Har 5 daqiqada deadline yaqinlashgan va o'tgan entity'larni tekshirish.
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkDeadlines(): Promise<void> {
    try {
      await this.checkWorkflowDeadlines()
      await this.checkWorkflowStepDeadlines()
      await this.checkTaskDeadlines()
    } catch (err: any) {
      this.logger.error(`Deadline check failed: ${err?.message}`, err?.stack)
    }
  }

  // ═══════════════════════════════════════════════════
  // WORKFLOW DEADLINES
  // ═══════════════════════════════════════════════════

  private async checkWorkflowDeadlines(): Promise<void> {
    const now = new Date()

    // Faol workflow'lar bilan deadline bor
    const workflows = await this.prisma.workflow.findMany({
      where: {
        status: { in: ['ACTIVE', 'PAUSED'] },
        deadline: { not: null },
        deletedAt: null,
      },
      select: {
        id: true,
        deadline: true,
        document: {
          select: {
            id: true,
            title: true,
            documentNumber: true,
            createdById: true,
          },
        },
        workflowSteps: {
          where: { deletedAt: null },
          select: { assignedToUserId: true },
        },
      },
    })

    for (const wf of workflows) {
      if (!wf.deadline) continue

      // Assignee'lar + document creator
      const userIds = [
        ...new Set([
          wf.document.createdById,
          ...wf.workflowSteps
            .map((s) => s.assignedToUserId)
            .filter(Boolean) as string[],
        ]),
      ]

      await this.processDeadline({
        entityType: 'workflow',
        entityId: wf.id,
        title: wf.document.title || wf.document.documentNumber || 'Workflow',
        deadline: wf.deadline,
        assigneeUserIds: userIds,
        metadata: {
          documentId: wf.document.id,
          documentTitle: wf.document.title,
          documentNumber: wf.document.documentNumber,
        },
      })
    }
  }

  // ═══════════════════════════════════════════════════
  // WORKFLOW STEP DEADLINES
  // ═══════════════════════════════════════════════════

  private async checkWorkflowStepDeadlines(): Promise<void> {
    const steps = await this.prisma.workflowStep.findMany({
      where: {
        status: { in: ['NOT_STARTED', 'IN_PROGRESS'] },
        dueDate: { not: null },
        deletedAt: null,
        assignedToUserId: { not: null },
      },
      select: {
        id: true,
        order: true,
        dueDate: true,
        actionType: true,
        assignedToUserId: true,
        workflow: {
          select: {
            id: true,
            document: {
              select: {
                id: true,
                title: true,
                documentNumber: true,
              },
            },
          },
        },
      },
    })

    for (const step of steps) {
      if (!step.dueDate || !step.assignedToUserId) continue

      await this.processDeadline({
        entityType: 'workflow_step',
        entityId: step.id,
        title: `${step.order}-bosqich: ${step.workflow.document.title || ''}`,
        deadline: step.dueDate,
        assigneeUserIds: [step.assignedToUserId],
        metadata: {
          stepOrder: step.order,
          actionType: step.actionType,
          workflowId: step.workflow.id,
          documentId: step.workflow.document.id,
          documentTitle: step.workflow.document.title,
        },
      })
    }
  }

  // ═══════════════════════════════════════════════════
  // TASK DEADLINES
  // ═══════════════════════════════════════════════════

  private async checkTaskDeadlines(): Promise<void> {
    const tasks = await this.prisma.task.findMany({
      where: {
        completedAt: null,
        dueDate: { not: null },
        deletedAt: null,
        isArchived: false,
      },
      select: {
        id: true,
        title: true,
        taskNumber: true,
        dueDate: true,
        createdById: true,
        assignees: {
          select: { userId: true },
        },
        project: {
          select: { name: true, key: true },
        },
      },
    })

    for (const task of tasks) {
      if (!task.dueDate) continue

      const userIds = [
        ...new Set([
          task.createdById,
          ...task.assignees.map((a) => a.userId),
        ]),
      ]

      await this.processDeadline({
        entityType: 'task',
        entityId: task.id,
        title: task.title,
        deadline: task.dueDate,
        assigneeUserIds: userIds,
        metadata: {
          taskNumber: task.taskNumber,
          projectName: task.project?.name,
          projectKey: task.project?.key,
        },
      })
    }
  }

  // ═══════════════════════════════════════════════════
  // CORE — process single deadline
  // ═══════════════════════════════════════════════════

  private async processDeadline(candidate: DeadlineCandidate): Promise<void> {
    const now = new Date()
    const msUntilDeadline = candidate.deadline.getTime() - now.getTime()
    const minutesUntilDeadline = msUntilDeadline / 60000

    for (const userId of candidate.assigneeUserIds) {
      // User sozlamalarini olish (yoki default)
      const settings = await this.getUserSettings(userId, candidate.entityType)

      if (!settings.notifyOnApproaching && !settings.notifyOnExpired) continue

      // Approaching — oldindan ogohlantirish
      if (settings.notifyOnApproaching && minutesUntilDeadline > 0) {
        for (const reminderMinutes of settings.reminders) {
          if (
            minutesUntilDeadline <= reminderMinutes &&
            minutesUntilDeadline > reminderMinutes - 5 // 5 min window
          ) {
            await this.sendIfNotSent(
              userId,
              candidate,
              `approaching_${reminderMinutes}`,
              this.formatApproachingMessage(candidate, reminderMinutes),
            )
          }
        }
      }

      // Expired — deadline o'tgan
      if (settings.notifyOnExpired && minutesUntilDeadline <= 0) {
        await this.sendIfNotSent(
          userId,
          candidate,
          'expired',
          this.formatExpiredMessage(candidate),
        )
      }
    }
  }

  private async getUserSettings(
    userId: string,
    entityType: string,
  ): Promise<{
    reminders: number[]
    notifyOnApproaching: boolean
    notifyOnExpired: boolean
    inApp: boolean
    telegram: boolean
  }> {
    const settings = await this.prisma.userNotificationSettings.findUnique({
      where: { userId },
    })

    if (!settings) {
      // Default
      return {
        reminders: entityType === 'task' ? [1440, 60] : [1440, 120],
        notifyOnApproaching: true,
        notifyOnExpired: true,
        inApp: true,
        telegram: true,
      }
    }

    const reminders =
      entityType === 'task'
        ? (settings.taskReminders as number[])
        : (settings.workflowReminders as number[])

    return {
      reminders: Array.isArray(reminders) ? reminders : [1440, 120],
      notifyOnApproaching: settings.notifyOnApproaching,
      notifyOnExpired: settings.notifyOnExpired,
      inApp: settings.inAppEnabled,
      telegram: settings.telegramEnabled,
    }
  }

  private async sendIfNotSent(
    userId: string,
    candidate: DeadlineCandidate,
    deliveryKey: string,
    message: string,
  ): Promise<void> {
    // Idempotency check
    const existing = await this.prisma.notificationDelivery.findUnique({
      where: {
        userId_entityType_entityId_deliveryKey: {
          userId,
          entityType: candidate.entityType,
          entityId: candidate.entityId,
          deliveryKey,
        },
      },
    })

    if (existing) {
      // Deadline o'zgargan bo'lishi mumkin — snapshot tekshirish
      if (
        existing.deadlineSnapshot.getTime() === candidate.deadline.getTime()
      ) {
        return // allaqachon yuborilgan, o'zgarmagan
      }
      // Deadline o'zgardi — eski record o'chirib qayta yuborish
      await this.prisma.notificationDelivery.delete({
        where: { id: existing.id },
      })
    }

    // Notification yaratish
    try {
      const typeMap: Record<string, NotificationType> = {
        'workflow_expired': NotificationType.WORKFLOW_DEADLINE_EXPIRED,
        'workflow_approaching': NotificationType.WORKFLOW_DEADLINE_APPROACHING,
        'workflow_step_expired': NotificationType.WORKFLOW_STEP_DEADLINE_EXPIRED,
        'workflow_step_approaching': NotificationType.WORKFLOW_STEP_DEADLINE_APPROACHING,
        'task_expired': NotificationType.TASK_DEADLINE_EXPIRED,
        'task_approaching': NotificationType.TASK_DEADLINE_APPROACHING,
      }
      const action = deliveryKey === 'expired' ? 'expired' : 'approaching'
      const notificationType =
        typeMap[`${candidate.entityType}_${action}`] ||
        NotificationType.TASK_DUE_SOON

      await this.notificationService.createNotification({
        type: notificationType,
        userId,
        title: message,
        message: `Deadline: ${candidate.deadline.toLocaleDateString('uz-UZ', { timeZone: 'Asia/Tashkent' })}`,
        metadata: candidate.metadata,
      } as any)

      // Delivery record
      await this.prisma.notificationDelivery.create({
        data: {
          userId,
          entityType: candidate.entityType,
          entityId: candidate.entityId,
          deliveryKey,
          deadlineSnapshot: candidate.deadline,
        },
      })

      this.logger.log(
        `[deadline] ${deliveryKey} sent to ${userId} for ${candidate.entityType}=${candidate.entityId}`,
      )
    } catch (err: any) {
      this.logger.warn(
        `[deadline] notification failed: ${err?.message}`,
      )
    }
  }

  // ═══════════════════════════════════════════════════
  // MESSAGE FORMATTING
  // ═══════════════════════════════════════════════════

  private formatApproachingMessage(
    candidate: DeadlineCandidate,
    minutesBefore: number,
  ): string {
    const timeStr =
      minutesBefore >= 1440
        ? `${Math.round(minutesBefore / 1440)} kun`
        : minutesBefore >= 60
          ? `${Math.round(minutesBefore / 60)} soat`
          : `${minutesBefore} daqiqa`

    const typeUz =
      candidate.entityType === 'task'
        ? 'Topshiriq'
        : candidate.entityType === 'workflow_step'
          ? 'Workflow bosqichi'
          : 'Workflow'

    return `⏰ ${typeUz} muddat tugashiga ${timeStr} qoldi: "${candidate.title}"`
  }

  private formatExpiredMessage(candidate: DeadlineCandidate): string {
    const typeUz =
      candidate.entityType === 'task'
        ? 'Topshiriq'
        : candidate.entityType === 'workflow_step'
          ? 'Workflow bosqichi'
          : 'Workflow'

    return `🔴 ${typeUz} muddati tugadi: "${candidate.title}"`
  }
}
