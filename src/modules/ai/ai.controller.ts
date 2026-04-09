import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthGuard, PermissionGuard } from '@guards'
import { Permissions } from '@decorators'
import { PERMISSIONS } from '@constants'
import { AiService } from './ai.service'
import { IsNotEmpty, IsString, Length } from 'class-validator'

class ChatDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 2000)
  message: string
}

@ApiBearerAuth()
@ApiTags('AI Chatbot')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({ path: 'ai', version: '1' })
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @Permissions(PERMISSIONS.NOTIFICATION.READ)  // har kimda bor — AI hamma uchun ochiq
  @Throttle({ short: { ttl: 60000, limit: 10 } })
  @ApiOperation({
    summary: 'AI yordamchi bilan suhbat',
    description:
      "Tabiiy o'zbek tilida savol bering — AI tushunadi va javob beradi.",
  })
  async chat(@Body() body: ChatDto, @Req() req: any) {
    return this.aiService.chat({
      userId: req.user.userId,
      message: body.message,
      roleName: req.user.roleName,
      departmentId: req.user.departmentId,
      fullname: req.user.fullname,
    })
  }

  @Get('history')
  @Permissions(PERMISSIONS.NOTIFICATION.READ)
  @ApiOperation({ summary: 'Suhbat tarixi' })
  async history(@Req() req: any) {
    return this.aiService.getHistory(req.user.userId)
  }

  @Delete('history')
  @Permissions(PERMISSIONS.NOTIFICATION.READ)
  @ApiOperation({ summary: 'Suhbat tarixini tozalash' })
  async clearHistory(@Req() req: any) {
    return this.aiService.clearHistory(req.user.userId)
  }
}
