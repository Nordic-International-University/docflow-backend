import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '@prisma'
import {
  NotificationSettingsDto,
  NotificationSettingsResponseDto,
} from './deadline-settings.dto'

// Default qiymatlar — user hali sozlamagan bo'lsa
const DEFAULTS = {
  workflowReminders: [1440, 120] as number[], // 24h, 2h
  taskReminders: [1440, 60] as number[], // 24h, 1h
  inAppEnabled: true,
  telegramEnabled: true,
  notifyOnExpired: true,
  notifyOnApproaching: true,
}

@Injectable()
export class DeadlineSettingsService {
  private readonly logger = new Logger(DeadlineSettingsService.name)

  constructor(private readonly prisma: PrismaService) {}

  async getSettings(userId: string): Promise<NotificationSettingsResponseDto> {
    const settings = await this.prisma.userNotificationSettings.findUnique({
      where: { userId },
    })

    const result = {
      workflowReminders: this.parseReminders(settings?.workflowReminders, DEFAULTS.workflowReminders),
      taskReminders: this.parseReminders(settings?.taskReminders, DEFAULTS.taskReminders),
      inAppEnabled: settings?.inAppEnabled ?? DEFAULTS.inAppEnabled,
      telegramEnabled: settings?.telegramEnabled ?? DEFAULTS.telegramEnabled,
      notifyOnExpired: settings?.notifyOnExpired ?? DEFAULTS.notifyOnExpired,
      notifyOnApproaching: settings?.notifyOnApproaching ?? DEFAULTS.notifyOnApproaching,
    }

    return {
      ...result,
      readableReminders: {
        workflow: result.workflowReminders.map(this.minutesToReadable),
        task: result.taskReminders.map(this.minutesToReadable),
      },
    }
  }

  async updateSettings(
    userId: string,
    dto: NotificationSettingsDto,
  ): Promise<NotificationSettingsResponseDto> {
    // Sort reminders descending (katta → kichik)
    const workflowReminders = dto.workflowReminders
      ? [...dto.workflowReminders].sort((a, b) => b - a)
      : undefined
    const taskReminders = dto.taskReminders
      ? [...dto.taskReminders].sort((a, b) => b - a)
      : undefined

    await this.prisma.userNotificationSettings.upsert({
      where: { userId },
      create: {
        userId,
        workflowReminders: workflowReminders ?? DEFAULTS.workflowReminders,
        taskReminders: taskReminders ?? DEFAULTS.taskReminders,
        inAppEnabled: dto.inAppEnabled ?? DEFAULTS.inAppEnabled,
        telegramEnabled: dto.telegramEnabled ?? DEFAULTS.telegramEnabled,
        notifyOnExpired: dto.notifyOnExpired ?? DEFAULTS.notifyOnExpired,
        notifyOnApproaching: dto.notifyOnApproaching ?? DEFAULTS.notifyOnApproaching,
      },
      update: {
        ...(workflowReminders !== undefined && { workflowReminders }),
        ...(taskReminders !== undefined && { taskReminders }),
        ...(dto.inAppEnabled !== undefined && { inAppEnabled: dto.inAppEnabled }),
        ...(dto.telegramEnabled !== undefined && { telegramEnabled: dto.telegramEnabled }),
        ...(dto.notifyOnExpired !== undefined && { notifyOnExpired: dto.notifyOnExpired }),
        ...(dto.notifyOnApproaching !== undefined && { notifyOnApproaching: dto.notifyOnApproaching }),
      },
    })

    this.logger.log(`[settings] Updated notification settings for user ${userId}`)

    return this.getSettings(userId)
  }

  private parseReminders(value: unknown, fallback: number[]): number[] {
    if (Array.isArray(value)) {
      return value.filter((v): v is number => typeof v === 'number' && v > 0)
    }
    return fallback
  }

  private minutesToReadable(minutes: number): string {
    if (minutes >= 1440) {
      const days = Math.round(minutes / 1440)
      return `${days} kun oldin`
    }
    if (minutes >= 60) {
      const hours = Math.round(minutes / 60)
      return `${hours} soat oldin`
    }
    return `${minutes} daqiqa oldin`
  }
}
