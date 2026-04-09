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
import { TaskChecklistService } from './task-checklist.service'
import {
  TaskChecklistCreateDto,
  TaskChecklistUpdateDto,
  TaskChecklistRetrieveQueryDto,
  TaskChecklistListResponseDto,
  TaskChecklistResponseDto,
  TaskChecklistItemCreateDto,
  TaskChecklistItemUpdateDto,
  TaskChecklistItemRetrieveQueryDto,
  TaskChecklistItemResponseDto,
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
@ApiTags('Task Checklist')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'task-checklist',
  version: '1',
})
export class TaskChecklistController {
  constructor(private readonly taskChecklistService: TaskChecklistService) {}

  // ==================== CHECKLIST ENDPOINTS ====================

  @Get()
  @Permissions(PERMISSIONS.TASK.UPDATE)
  @ApiOperation({ summary: 'Task Checklist Retrieve All' })
  @ApiQuery({ name: 'taskId', required: true, type: String })
  @ApiQuery({ name: 'pageNumber', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, type: TaskChecklistListResponseDto })
  async taskChecklistRetrieveAll(
    @Query() payload: TaskChecklistRetrieveQueryDto,
  ) {
    return await this.taskChecklistService.taskChecklistRetrieveAll(payload)
  }

  @Get(':id')
  @Permissions(PERMISSIONS.TASK.UPDATE)
  @ApiOperation({ summary: 'Task Checklist Retrieve One' })
  @ApiResponse({ status: 200, type: TaskChecklistResponseDto })
  async taskChecklistRetrieveOne(@Param('id') id: string) {
    return await this.taskChecklistService.taskChecklistRetrieveOne({ id })
  }

  @Post()
  @Permissions(PERMISSIONS.TASK.UPDATE)
  @ApiOperation({ summary: 'Task Checklist Create' })
  @ApiResponse({
    status: 201,
    description: 'Task checklist created successfully',
  })
  async taskChecklistCreate(
    @Body() payload: TaskChecklistCreateDto,
    @Req() req: any,
  ) {
    return await this.taskChecklistService.taskChecklistCreate({
      ...payload,
      createdBy: req.user?.userId,
    })
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.TASK.UPDATE)
  @ApiOperation({ summary: 'Task Checklist Update' })
  @ApiResponse({
    status: 200,
    description: 'Task checklist updated successfully',
  })
  async taskChecklistUpdate(
    @Param('id') id: string,
    @Body() payload: TaskChecklistUpdateDto,
    @Req() req: any,
  ) {
    return await this.taskChecklistService.taskChecklistUpdate({
      id,
      ...payload,
      updatedBy: req.user?.userId,
    })
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.TASK.UPDATE)
  @ApiOperation({ summary: 'Task Checklist Delete' })
  @ApiResponse({
    status: 200,
    description: 'Task checklist deleted successfully',
  })
  async taskChecklistDelete(@Param('id') id: string, @Req() req: any) {
    return await this.taskChecklistService.taskChecklistDelete({
      id,
      deletedBy: req.user?.userId,
    })
  }

  // ==================== CHECKLIST ITEM ENDPOINTS ====================

  @Get(':checklistId/items')
  @Permissions(PERMISSIONS.TASK.UPDATE)
  @ApiOperation({ summary: 'Task Checklist Item Retrieve All' })
  @ApiQuery({ name: 'pageNumber', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, type: TaskChecklistListResponseDto })
  async taskChecklistItemRetrieveAll(
    @Param('checklistId') checklistId: string,
    @Query() payload: TaskChecklistItemRetrieveQueryDto,
  ) {
    return await this.taskChecklistService.taskChecklistItemRetrieveAll({
      checklistId,
      ...payload,
    })
  }

  @Get(':checklistId/items/:itemId')
  @Permissions(PERMISSIONS.TASK.UPDATE)
  @ApiOperation({ summary: 'Task Checklist Item Retrieve One' })
  @ApiResponse({ status: 200, type: TaskChecklistItemResponseDto })
  async taskChecklistItemRetrieveOne(@Param('itemId') itemId: string) {
    return await this.taskChecklistService.taskChecklistItemRetrieveOne({
      id: itemId,
    })
  }

  @Post(':checklistId/items')
  @Permissions(PERMISSIONS.TASK.UPDATE)
  @ApiOperation({ summary: 'Task Checklist Item Create' })
  @ApiResponse({
    status: 201,
    description: 'Task checklist item created successfully',
  })
  async taskChecklistItemCreate(
    @Param('checklistId') checklistId: string,
    @Body() payload: Omit<TaskChecklistItemCreateDto, 'checklistId'>,
    @Req() req: any,
  ) {
    return await this.taskChecklistService.taskChecklistItemCreate({
      checklistId,
      ...payload,
      createdBy: req.user?.userId,
    })
  }

  @Patch(':checklistId/items/:itemId')
  @Permissions(PERMISSIONS.TASK.UPDATE)
  @ApiOperation({ summary: 'Task Checklist Item Update' })
  @ApiResponse({
    status: 200,
    description: 'Task checklist item updated successfully',
  })
  async taskChecklistItemUpdate(
    @Param('itemId') itemId: string,
    @Body() payload: TaskChecklistItemUpdateDto,
    @Req() req: any,
  ) {
    return await this.taskChecklistService.taskChecklistItemUpdate({
      id: itemId,
      ...payload,
      updatedBy: req.user?.userId,
    })
  }

  @Delete(':checklistId/items/:itemId')
  @Permissions(PERMISSIONS.TASK.UPDATE)
  @ApiOperation({ summary: 'Task Checklist Item Delete' })
  @ApiResponse({
    status: 200,
    description: 'Task checklist item deleted successfully',
  })
  async taskChecklistItemDelete(
    @Param('itemId') itemId: string,
    @Req() req: any,
  ) {
    return await this.taskChecklistService.taskChecklistItemDelete({
      id: itemId,
      deletedBy: req.user?.userId,
    })
  }
}
