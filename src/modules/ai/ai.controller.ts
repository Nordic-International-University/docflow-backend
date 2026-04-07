import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthGuard } from '@guards'
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
@UseGuards(AuthGuard)
@Controller({ path: 'ai', version: '1' })
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @ApiOperation({
    summary: 'AI yordamchi bilan suhbat',
    description: "Tabiiy o'zbek tilida savol bering — AI tushunadi va javob beradi.",
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
  @ApiOperation({ summary: "Suhbat tarixi" })
  async history(@Req() req: any) {
    return this.aiService.getHistory(req.user.userId)
  }

  @Delete('history')
  @ApiOperation({ summary: "Suhbat tarixini tozalash" })
  async clearHistory(@Req() req: any) {
    return this.aiService.clearHistory(req.user.userId)
  }
}
