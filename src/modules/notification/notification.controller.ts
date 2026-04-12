import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger'
import { AuthGuard } from '@guards'
import { NotificationService } from './notification.service'
import { NotificationGateway } from './notification.gateway'
import { NotificationListResponseDto, NotificationResponseDto } from './dtos'
import { PermissionGuard } from '@guards'
import { Permissions } from '@decorators'
import { PERMISSIONS } from '@constants'
import { PoliciesGuard, CheckPolicies } from '../../casl'

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller({ path: 'notifications', version: '1' })
@UseGuards(AuthGuard, PermissionGuard, PoliciesGuard)
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  @Get()
  @Permissions(PERMISSIONS.NOTIFICATION.READ)
  @CheckPolicies((ability) => ability.can('read', 'Notification'))
  @ApiOperation({
    summary: 'Foydalanuvchi bildirishnomalarini olish',
    description:
      "Joriy foydalanuvchi uchun bildirishnomalar ro'yxatini qaytaradi. O'qilgan/o'qilmagan filtri va limitni belgilash mumkin.",
  })
  @ApiQuery({
    name: 'isRead',
    required: false,
    type: String,
    description:
      "O'qilgan bildirishnomalarni filtrlash (true/false). Ko'rsatilmasa, barchasi qaytariladi.",
    example: 'false',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Qaytariladigan bildirishnomalar soni (standart: 50)',
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Bildirishnomalar muvaffaqiyatli qaytarildi',
    type: NotificationListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Autentifikatsiya talab qilinadi' })
  async getNotifications(
    @Request() req,
    @Query('isRead') isRead?: string,
    @Query('limit') limit?: string,
  ) {
    const isReadFilter =
      isRead === 'true' ? true : isRead === 'false' ? false : undefined
    const limitNum = limit ? parseInt(limit, 10) : 50

    return this.notificationService.getNotifications(
      req.user.userId,
      isReadFilter,
      limitNum,
    )
  }

  @Get('unread-count')
  @Permissions(PERMISSIONS.NOTIFICATION.READ)
  @CheckPolicies((ability) => ability.can('read', 'Notification'))
  @ApiOperation({
    summary: "O'qilmagan bildirishnomalar sonini olish",
    description:
      "Joriy foydalanuvchi uchun o'qilmagan bildirishnomalar sonini qaytaradi.",
  })
  @ApiResponse({
    status: 200,
    description: "O'qilmagan bildirishnomalar soni muvaffaqiyatli qaytarildi",
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', example: 5 },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Autentifikatsiya talab qilinadi' })
  async getUnreadCount(@Request() req) {
    const count = await this.notificationService.getUnreadCount(req.user.userId)
    return { count }
  }

  @Post(':id/read')
  @Permissions(PERMISSIONS.NOTIFICATION.READ)
  @CheckPolicies((ability) => ability.can('read', 'Notification'))
  @ApiOperation({
    summary: "Bildirishnomani o'qilgan deb belgilash",
    description:
      "Berilgan ID bo'yicha bildirishnomani o'qilgan deb belgilaydi.",
  })
  @ApiParam({
    name: 'id',
    description: 'Bildirishnoma IDsi',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: "Bildirishnoma muvaffaqiyatli o'qilgan deb belgilandi",
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Autentifikatsiya talab qilinadi' })
  @ApiResponse({ status: 404, description: 'Bildirishnoma topilmadi' })
  async markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationService.markAsRead(id, req.user.userId)
  }

  @Post('read-all')
  @Permissions(PERMISSIONS.NOTIFICATION.READ)
  @CheckPolicies((ability) => ability.can('read', 'Notification'))
  @ApiOperation({
    summary: "Barcha bildirishnomalarni o'qilgan deb belgilash",
    description:
      "Joriy foydalanuvchining barcha o'qilmagan bildirishnomalarini o'qilgan deb belgilaydi.",
  })
  @ApiResponse({
    status: 200,
    description:
      "Barcha bildirishnomalar muvaffaqiyatli o'qilgan deb belgilandi",
    schema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          example: 10,
          description: "O'zgartirilgan bildirishnomalar soni",
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Autentifikatsiya talab qilinadi' })
  async markAllAsRead(@Request() req) {
    return this.notificationService.markAllAsRead(req.user.userId)
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.NOTIFICATION.MANAGE)
  @CheckPolicies((ability) => ability.can('delete', 'Notification'))
  @ApiOperation({
    summary: "Bildirishnomani o'chirish",
    description:
      "Berilgan ID bo'yicha bildirishnomani o'chiradi (soft delete).",
  })
  @ApiParam({
    name: 'id',
    description: 'Bildirishnoma IDsi',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: "Bildirishnoma muvaffaqiyatli o'chirildi",
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Notification deleted successfully',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Autentifikatsiya talab qilinadi' })
  @ApiResponse({ status: 404, description: 'Bildirishnoma topilmadi' })
  async deleteNotification(@Param('id') id: string, @Request() req) {
    return this.notificationService.deleteNotification(id, req.user.userId)
  }

  @Get('online-users')
  @Permissions(PERMISSIONS.NOTIFICATION.READ)
  @CheckPolicies((ability) => ability.can('read', 'Notification'))
  @ApiOperation({
    summary: 'Get Online Users',
    description:
      'Get a list of all currently online users with their details. This endpoint provides real-time information about which users are connected to the system.',
  })
  @ApiResponse({
    status: 200,
    description: 'Online users list retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                example: '550e8400-e29b-41d4-a716-446655440000',
              },
              fullname: { type: 'string', example: 'John Doe' },
              username: { type: 'string', example: 'john_doe' },
              avatarUrl: {
                type: 'string',
                example: 'https://example.com/avatar.jpg',
                nullable: true,
              },
              department: {
                type: 'object',
                nullable: true,
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                },
              },
            },
          },
        },
        count: { type: 'number', example: 15 },
        timestamp: { type: 'string', example: '2024-12-15T10:30:00.000Z' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  async getOnlineUsers() {
    const users = await this.notificationGateway.getOnlineUsersWithDetails()

    return {
      users,
      count: users.length,
      timestamp: new Date().toISOString(),
    }
  }
}
