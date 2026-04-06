import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common'
import { BoardService } from './board.service'
import { BoardMoveDto } from './dtos'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AuthGuard, PermissionGuard } from '@guards'
import { Permissions } from '@decorators'
import { PERMISSIONS } from '@constants'

@ApiBearerAuth()
@ApiTags('Board')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'project/:projectId/board',
  version: '1',
})
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  @Permissions(PERMISSIONS.BOARD.VIEW)
  async boardRetrieve(@Param('projectId') projectId: string) {
    return await this.boardService.boardRetrieve(projectId)
  }

  @Patch('move')
  @Permissions(PERMISSIONS.BOARD.MOVE)
  async boardMove(
    @Param('projectId') projectId: string,
    @Body() payload: BoardMoveDto,
    @Req() req: any,
  ) {
    return await this.boardService.boardMove(
      projectId,
      payload,
      req.user.userId,
    )
  }
}
