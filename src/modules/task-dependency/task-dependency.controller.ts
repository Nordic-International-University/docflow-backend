import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { TaskDependencyService } from './task-dependency.service'
import {
  TaskDependencyCreateDto,
  TaskDependencyRetrieveQueryDto,
  TaskDependencyListResponseDto,
  TaskDependencyResponseDto,
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
@ApiTags('Task Dependency')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'task-dependency',
  version: '1',
})
export class TaskDependencyController {
  constructor(private readonly taskDependencyService: TaskDependencyService) {}

  @Get()
  @Permissions(PERMISSIONS.TASK.UPDATE)
  @ApiOperation({ summary: 'Task Dependency Retrieve All' })
  @ApiQuery({ name: 'pageNumber', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @ApiQuery({ name: 'taskId', required: false, type: String })
  @ApiQuery({ name: 'dependsOnTaskId', required: false, type: String })
  @ApiResponse({ status: 200, type: TaskDependencyListResponseDto })
  async taskDependencyRetrieveAll(
    @Query() payload: TaskDependencyRetrieveQueryDto,
  ) {
    return await this.taskDependencyService.taskDependencyRetrieveAll(payload)
  }

  @Get(':id')
  @Permissions(PERMISSIONS.TASK.UPDATE)
  @ApiOperation({ summary: 'Task Dependency Retrieve One' })
  @ApiResponse({ status: 200, type: TaskDependencyResponseDto })
  async taskDependencyRetrieveOne(@Param('id') id: string) {
    return await this.taskDependencyService.taskDependencyRetrieveOne({ id })
  }

  @Post()
  @Permissions(PERMISSIONS.TASK.UPDATE)
  @ApiOperation({ summary: 'Task Dependency Create' })
  @ApiResponse({
    status: 201,
    description: 'Task dependency created successfully',
  })
  async taskDependencyCreate(
    @Body() payload: TaskDependencyCreateDto,
    @Req() req: any,
  ) {
    return await this.taskDependencyService.taskDependencyCreate({
      ...payload,
      createdBy: req.user?.userId,
    })
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.TASK.UPDATE)
  @ApiOperation({ summary: 'Task Dependency Delete' })
  @ApiResponse({
    status: 200,
    description: 'Task dependency deleted successfully',
  })
  async taskDependencyDelete(@Param('id') id: string, @Req() req: any) {
    return await this.taskDependencyService.taskDependencyDelete({
      id,
      deletedBy: req.user?.userId,
    })
  }
}
