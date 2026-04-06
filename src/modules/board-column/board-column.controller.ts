import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { BoardColumnService } from './board-column.service'
import {
  BoardColumnCreateDto,
  BoardColumnUpdateDto,
  BoardColumnRetrieveQueryDto,
} from './dtos'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AuthGuard, PermissionGuard } from '@guards'
import { Permissions } from '@decorators'
import { PERMISSIONS } from '@constants'

@ApiBearerAuth()
@ApiTags('Board Column')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'board-column',
  version: '1',
})
export class BoardColumnController {
  constructor(private readonly boardColumnService: BoardColumnService) {}

  @Get()
  @Permissions(PERMISSIONS.BOARD_COLUMN.LIST)
  async boardColumnRetrieveAll(@Query() payload: BoardColumnRetrieveQueryDto) {
    return await this.boardColumnService.boardColumnRetrieveAll(payload)
  }

  @Post()
  @Permissions(PERMISSIONS.BOARD_COLUMN.CREATE)
  async boardColumnCreate(
    @Body() payload: BoardColumnCreateDto,
    @Req() req: any,
  ) {
    return await this.boardColumnService.boardColumnCreate({
      ...payload,
      createdBy: req.user.userId,
    })
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.BOARD_COLUMN.UPDATE)
  async boardColumnUpdate(
    @Param('id') id: string,
    @Body() payload: BoardColumnUpdateDto,
    @Req() req: any,
  ) {
    return await this.boardColumnService.boardColumnUpdate({
      id,
      ...payload,
      updatedBy: req.user.userId,
    })
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.BOARD_COLUMN.DELETE)
  async boardColumnDelete(@Param('id') id: string, @Req() req: any) {
    return await this.boardColumnService.boardColumnDelete({
      id,
      deletedBy: req.user.userId,
    })
  }

  @Post('reorder')
  @Permissions(PERMISSIONS.BOARD_COLUMN.REORDER)
  async boardColumnReorder(
    @Body() payload: { projectId: string; columnIds: string[] },
    @Req() req: any,
  ) {
    return await this.boardColumnService.boardColumnReorder(
      payload.projectId,
      payload.columnIds,
      req.user.userId,
    )
  }
}
