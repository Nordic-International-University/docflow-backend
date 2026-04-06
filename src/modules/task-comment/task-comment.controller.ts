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
import { TaskCommentService } from './task-comment.service'
import {
  TaskCommentCreateDto,
  TaskCommentUpdateDto,
  TaskCommentRetrieveQueryDto,
  TaskCommentListResponseDto,
  TaskCommentResponseDto,
} from './dtos'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { AuthGuard, PermissionGuard } from '@guards'
import { Permissions } from '@decorators'
import { PERMISSIONS } from '@constants'

@ApiBearerAuth()
@ApiTags('Task Comment')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'task-comment',
  version: '1',
})
export class TaskCommentController {
  constructor(private readonly taskCommentService: TaskCommentService) {}

  @Get()
  @Permissions(PERMISSIONS.TASK.COMMENT)
  @ApiOperation({ summary: 'Task Comment Retrieve All' })
  @ApiQuery({ name: 'taskId', required: true, type: String })
  @ApiQuery({ name: 'pageNumber', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @ApiResponse({ status: 200, type: TaskCommentListResponseDto })
  async taskCommentRetrieveAll(@Query() payload: TaskCommentRetrieveQueryDto) {
    return await this.taskCommentService.taskCommentRetrieveAll(payload)
  }

  @Get(':id')
  @Permissions(PERMISSIONS.TASK.COMMENT)
  @ApiOperation({ summary: 'Task Comment Retrieve One' })
  @ApiResponse({ status: 200, type: TaskCommentResponseDto })
  async taskCommentRetrieveOne(@Param('id') id: string) {
    return await this.taskCommentService.taskCommentRetrieveOne({ id })
  }

  @Post()
  @Permissions(PERMISSIONS.TASK.COMMENT)
  @ApiOperation({ summary: 'Task Comment Create' })
  @ApiResponse({
    status: 201,
    description: 'Task comment created successfully',
  })
  async taskCommentCreate(
    @Body() payload: TaskCommentCreateDto,
    @Req() req: any,
  ) {
    return await this.taskCommentService.taskCommentCreate({
      ...payload,
      userId: req.user?.userId,
    })
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.TASK.COMMENT)
  @ApiOperation({ summary: 'Task Comment Update' })
  @ApiResponse({
    status: 200,
    description: 'Task comment updated successfully',
  })
  async taskCommentUpdate(
    @Param('id') id: string,
    @Body() payload: TaskCommentUpdateDto,
    @Req() req: any,
  ) {
    return await this.taskCommentService.taskCommentUpdate({
      id,
      ...payload,
      updatedBy: req.user?.userId,
    })
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.TASK.COMMENT)
  @ApiOperation({ summary: 'Task Comment Delete' })
  @ApiResponse({
    status: 200,
    description: 'Task comment deleted successfully',
  })
  async taskCommentDelete(@Param('id') id: string, @Req() req: any) {
    return await this.taskCommentService.taskCommentDelete({
      id,
      deletedBy: req.user?.userId,
    })
  }
}
