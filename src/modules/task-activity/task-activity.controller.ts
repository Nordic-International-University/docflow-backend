import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { TaskActivityService } from './task-activity.service'
import {
  TaskActivityRetrieveQueryDto,
  TaskActivityListResponseDto,
  TaskActivityResponseDto,
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
@ApiTags('Task Activity')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'task-activity',
  version: '1',
})
export class TaskActivityController {
  constructor(private readonly taskActivityService: TaskActivityService) {}

  @Get()
  @Permissions(PERMISSIONS.TASK.READ)
  @ApiOperation({ summary: 'Task Activity Retrieve All' })
  @ApiQuery({
    name: 'taskId',
    required: true,
    type: String,
    description: 'Task ID to filter activities',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'Filter by user ID',
  })
  @ApiQuery({
    name: 'action',
    required: false,
    type: String,
    description: 'Filter by action type',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Filter activities from this date (ISO 8601)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Filter activities until this date (ISO 8601)',
  })
  @ApiQuery({ name: 'pageNumber', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @ApiResponse({ status: 200, type: TaskActivityListResponseDto })
  async taskActivityRetrieveAll(
    @Query() payload: TaskActivityRetrieveQueryDto,
  ) {
    return await this.taskActivityService.taskActivityRetrieveAll(payload)
  }

  @Get(':id')
  @Permissions(PERMISSIONS.TASK.READ)
  @ApiOperation({ summary: 'Task Activity Retrieve One' })
  @ApiResponse({ status: 200, type: TaskActivityResponseDto })
  async taskActivityRetrieveOne(@Param('id') id: string) {
    return await this.taskActivityService.taskActivityRetrieveOne({ id })
  }
}
