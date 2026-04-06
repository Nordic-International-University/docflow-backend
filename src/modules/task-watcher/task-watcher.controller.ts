import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { TaskWatcherService } from './task-watcher.service'
import { TaskWatcherRetrieveQueryDto, TaskWatcherListResponseDto } from './dtos'
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
@ApiTags('Task Watcher')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'task-watcher',
  version: '1',
})
export class TaskWatcherController {
  constructor(private readonly taskWatcherService: TaskWatcherService) {}

  @Get()
  @Permissions(PERMISSIONS.TASK.WATCH)
  @ApiOperation({ summary: 'Task Watcher Retrieve All' })
  @ApiQuery({ name: 'pageNumber', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @ApiQuery({ name: 'taskId', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiResponse({ status: 200, type: TaskWatcherListResponseDto })
  async taskWatcherRetrieveAll(@Query() payload: TaskWatcherRetrieveQueryDto) {
    return await this.taskWatcherService.taskWatcherRetrieveAll(payload)
  }

  @Post('watch/:taskId')
  @Permissions(PERMISSIONS.TASK.WATCH)
  @ApiOperation({ summary: 'Watch a task (current user)' })
  @ApiResponse({
    status: 201,
    description: 'Task watched successfully',
  })
  async taskWatcherWatch(@Param('taskId') taskId: string, @Req() req: any) {
    return await this.taskWatcherService.taskWatcherCreate({
      taskId,
      userId: req.user?.userId,
      createdBy: req.user?.userId,
    })
  }

  @Delete('unwatch/:taskId')
  @Permissions(PERMISSIONS.TASK.WATCH)
  @ApiOperation({ summary: 'Unwatch a task (current user)' })
  @ApiResponse({
    status: 200,
    description: 'Task unwatched successfully',
  })
  async taskWatcherUnwatch(@Param('taskId') taskId: string, @Req() req: any) {
    return await this.taskWatcherService.taskWatcherDelete({
      taskId,
      userId: req.user?.userId,
    })
  }
}
