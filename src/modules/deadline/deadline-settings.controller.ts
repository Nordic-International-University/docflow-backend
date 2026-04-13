/**
 * Deadline Notification Settings Controller.
 *
 * Har foydalanuvchi o'z notification sozlamalarini boshqaradi:
 * - Qancha vaqt oldin ogohlantirish (24h, 2h, 30min, ...)
 * - Qaysi kanallar (in-app, telegram)
 * - Muddati o'tganida xabar berishmi
 */

import {
  Body,
  Controller,
  Get,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { AuthGuard, PermissionGuard } from '@guards'
import { PoliciesGuard } from '../../casl'
import type { AuthenticatedRequest } from '../../common/types/request.types'
import { DeadlineSettingsService } from './deadline-settings.service'
import {
  NotificationSettingsDto,
  NotificationSettingsResponseDto,
} from './deadline-settings.dto'

@ApiTags('Notification Settings')
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard, PoliciesGuard)
@Controller({ path: 'user/notification-settings', version: '1' })
export class DeadlineSettingsController {
  constructor(private readonly settingsService: DeadlineSettingsService) {}

  @Get()
  @ApiOperation({
    summary: 'Mening notification sozlamalarim',
    description:
      "Foydalanuvchining deadline notification sozlamalarini olish. Agar hali sozlanmagan bo'lsa — default qiymatlar qaytariladi.",
  })
  @ApiResponse({ status: 200, type: NotificationSettingsResponseDto })
  async getMySettings(
    @Req() req: AuthenticatedRequest,
  ): Promise<NotificationSettingsResponseDto> {
    return this.settingsService.getSettings(req.user.userId)
  }

  @Put()
  @ApiOperation({
    summary: 'Notification sozlamalarni yangilash',
    description:
      "Deadline reminder vaqtlarini, kanallarni (in-app, telegram), expired notification'ni sozlash. Har foydalanuvchi o'zi boshqaradi.",
  })
  @ApiResponse({ status: 200, type: NotificationSettingsResponseDto })
  async updateMySettings(
    @Req() req: AuthenticatedRequest,
    @Body() dto: NotificationSettingsDto,
  ): Promise<NotificationSettingsResponseDto> {
    return this.settingsService.updateSettings(req.user.userId, dto)
  }
}
