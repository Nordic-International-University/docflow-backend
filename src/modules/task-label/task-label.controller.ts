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
import { TaskLabelService } from './task-label.service'
import {
  TaskLabelCreateDto,
  TaskLabelRetrieveQueryDto,
  TaskLabelListResponseDto,
  TaskLabelResponseDto,
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
@ApiTags('Task Label')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'task-label',
  version: '1',
})
export class TaskLabelController {
  constructor(private readonly taskLabelService: TaskLabelService) {}

  @Get()
  @Permissions(PERMISSIONS.TASK.UPDATE)
  @ApiOperation({ summary: 'Task Label Retrieve All' })
  @ApiQuery({ name: 'pageNumber', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @ApiQuery({ name: 'taskId', required: false, type: String })
  @ApiQuery({ name: 'labelId', required: false, type: String })
  @ApiResponse({ status: 200, type: TaskLabelListResponseDto })
  async taskLabelRetrieveAll(@Query() payload: TaskLabelRetrieveQueryDto) {
    return await this.taskLabelService.taskLabelRetrieveAll(payload)
  }

  @Get(':id')
  @Permissions(PERMISSIONS.TASK.UPDATE)
  @ApiOperation({ summary: 'Task Label Retrieve One' })
  @ApiResponse({ status: 200, type: TaskLabelResponseDto })
  async taskLabelRetrieveOne(@Param('id') id: string) {
    return await this.taskLabelService.taskLabelRetrieveOne({ id })
  }

  @Post()
  @Permissions(PERMISSIONS.TASK.UPDATE)
  @ApiOperation({ summary: 'Assign Label to Task' })
  @ApiResponse({
    status: 201,
    description: 'Label assigned to task successfully',
  })
  async taskLabelCreate(@Body() payload: TaskLabelCreateDto, @Req() req: any) {
    return await this.taskLabelService.taskLabelCreate({
      ...payload,
      createdBy: req.user?.userId,
    })
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.TASK.UPDATE)
  @ApiOperation({ summary: 'Remove Label from Task' })
  @ApiResponse({
    status: 200,
    description: 'Label removed from task successfully',
  })
  async taskLabelDelete(@Param('id') id: string, @Req() req: any) {
    return await this.taskLabelService.taskLabelDelete({
      id,
      deletedBy: req.user?.userId,
    })
  }
}
