import {
  Controller,
  Get,
  Delete,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger'
import { AuthGuard, PermissionGuard } from '@guards'
import { Permissions } from '@decorators'
import { PERMISSIONS } from '@constants'
import { SessionService } from './session.service'
import {
  SessionRetrieveAllDto,
  SessionListResponseDto,
  SessionItemDto,
} from './dtos'

@ApiTags('Sessions')
@ApiBearerAuth()
@Controller({ path: 'sessions', version: '1' })
@UseGuards(AuthGuard, PermissionGuard)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  @Permissions(PERMISSIONS.SESSION.LIST)
  @ApiOperation({
    summary: "Faol sessiyalar ro'yxatini olish",
    description:
      "Joriy foydalanuvchining barcha faol sessiyalari (qurilmalari) ro'yxatini qaytaradi.",
  })
  @ApiResponse({
    status: 200,
    description: "Sessiyalar ro'yxati muvaffaqiyatli qaytarildi",
    type: SessionListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Autentifikatsiya talab qilinadi' })
  async sessionRetrieveAll(
    @Query() payload: SessionRetrieveAllDto,
    @Request() req,
  ): Promise<SessionListResponseDto> {
    return this.sessionService.sessionRetrieveAll(payload, req.user.userId, req.user.sessionId)
  }

  @Get(':id')
  @Permissions(PERMISSIONS.SESSION.READ)
  @ApiOperation({
    summary: "Sessiya ma'lumotlarini olish",
    description: "Berilgan ID bo'yicha sessiya ma'lumotlarini qaytaradi.",
  })
  @ApiParam({
    name: 'id',
    description: 'Sessiya IDsi',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: "Sessiya ma'lumotlari muvaffaqiyatli qaytarildi",
    type: SessionItemDto,
  })
  @ApiResponse({ status: 401, description: 'Autentifikatsiya talab qilinadi' })
  @ApiResponse({ status: 404, description: 'Sessiya topilmadi' })
  async sessionRetrieveOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<SessionItemDto> {
    return this.sessionService.sessionRetrieveOne(id, req.user.userId, req.user.sessionId)
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.SESSION.REVOKE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sessiyani bekor qilish (logout)',
    description:
      "Berilgan ID bo'yicha sessiyani bekor qiladi. Bu qurilmadan chiqish (logout) qilishga teng.",
  })
  @ApiParam({
    name: 'id',
    description: 'Sessiya IDsi',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Sessiya muvaffaqiyatli bekor qilindi',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Sessiya muvaffaqiyatli bekor qilindi',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Autentifikatsiya talab qilinadi' })
  @ApiResponse({ status: 404, description: 'Sessiya topilmadi' })
  async sessionRevoke(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<{ message: string }> {
    await this.sessionService.sessionRevoke(id, req.user.userId)
    return { message: 'Sessiya muvaffaqiyatli bekor qilindi' }
  }

  @Post('revoke-all')
  @Permissions(PERMISSIONS.SESSION.REVOKE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Barcha sessiyalarni bekor qilish',
    description:
      'Joriy sessiyadan tashqari barcha sessiyalarni bekor qiladi. Boshqa barcha qurilmalardan chiqish qilishga teng.',
  })
  @ApiResponse({
    status: 200,
    description: 'Barcha sessiyalar muvaffaqiyatli bekor qilindi',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Barcha sessiyalar muvaffaqiyatli bekor qilindi',
        },
        count: {
          type: 'number',
          example: 3,
          description: 'Bekor qilingan sessiyalar soni',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Autentifikatsiya talab qilinadi' })
  async sessionRevokeAll(
    @Request() req,
  ): Promise<{ message: string; count: number }> {
    const count = await this.sessionService.sessionRevokeAll(req.user.userId, req.user.sessionId)
    return {
      message: 'Barcha sessiyalar muvaffaqiyatli bekor qilindi',
      count,
    }
  }
}
