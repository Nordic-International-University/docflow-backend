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
import { TaskTimeEntryService } from './task-time-entry.service'
import {
  TaskTimeEntryCreateDto,
  TaskTimeEntryUpdateDto,
  TaskTimeEntryRetrieveQueryDto,
  TaskTimeEntryListResponseDto,
  TaskTimeEntryResponseDto,
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
@ApiTags('Task Time Entry')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'task-time-entry',
  version: '1',
})
export class TaskTimeEntryController {
  constructor(private readonly taskTimeEntryService: TaskTimeEntryService) {}

  @Get()
  @Permissions(PERMISSIONS.TASK.TIME_TRACK)
  @ApiOperation({ summary: 'Task Time Entry Retrieve All' })
  @ApiQuery({ name: 'pageNumber', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @ApiQuery({ name: 'taskId', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'isBillable', required: false, type: Boolean })
  @ApiResponse({ status: 200, type: TaskTimeEntryListResponseDto })
  async taskTimeEntryRetrieveAll(
    @Query() payload: TaskTimeEntryRetrieveQueryDto,
  ) {
    return await this.taskTimeEntryService.taskTimeEntryRetrieveAll(payload)
  }

  @Get(':id')
  @Permissions(PERMISSIONS.TASK.TIME_TRACK)
  @ApiOperation({ summary: 'Task Time Entry Retrieve One' })
  @ApiResponse({ status: 200, type: TaskTimeEntryResponseDto })
  async taskTimeEntryRetrieveOne(@Param('id') id: string) {
    return await this.taskTimeEntryService.taskTimeEntryRetrieveOne({ id })
  }

  @Post()
  @Permissions(PERMISSIONS.TASK.TIME_TRACK)
  @ApiOperation({ summary: 'Task Time Entry Create' })
  @ApiResponse({
    status: 201,
    description: 'Time entry created successfully',
  })
  async taskTimeEntryCreate(
    @Body() payload: TaskTimeEntryCreateDto,
    @Req() req: any,
  ) {
    return await this.taskTimeEntryService.taskTimeEntryCreate({
      ...payload,
      userId: req.user?.userId,
      createdBy: req.user?.userId,
    })
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.TASK.TIME_TRACK)
  @ApiOperation({ summary: 'Task Time Entry Update' })
  @ApiResponse({
    status: 200,
    description: 'Time entry updated successfully',
  })
  async taskTimeEntryUpdate(
    @Param('id') id: string,
    @Body() payload: TaskTimeEntryUpdateDto,
    @Req() req: any,
  ) {
    return await this.taskTimeEntryService.taskTimeEntryUpdate({
      id,
      ...payload,
      updatedBy: req.user?.userId,
    })
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.TASK.TIME_TRACK)
  @ApiOperation({ summary: 'Task Time Entry Delete' })
  @ApiResponse({
    status: 200,
    description: 'Time entry deleted successfully',
  })
  async taskTimeEntryDelete(@Param('id') id: string, @Req() req: any) {
    return await this.taskTimeEntryService.taskTimeEntryDelete({
      id,
      deletedBy: req.user?.userId,
    })
  }
}
