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
import { TaskCategoryService } from './task-category.service'
import {
  TaskCategoryCreateDto,
  TaskCategoryUpdateDto,
  TaskCategoryRetrieveQueryDto,
  TaskCategoryListResponseDto,
  TaskCategoryResponseDto,
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
@ApiTags('Task Category')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'task-category',
  version: '1',
})
export class TaskCategoryController {
  constructor(private readonly taskCategoryService: TaskCategoryService) {}

  @Get()
  @Permissions(PERMISSIONS.TASK_CATEGORY.LIST)
  @ApiOperation({ summary: 'Task Category Retrieve All' })
  @ApiQuery({ name: 'pageNumber', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, type: TaskCategoryListResponseDto })
  async taskCategoryRetrieveAll(
    @Query() payload: TaskCategoryRetrieveQueryDto,
  ) {
    return await this.taskCategoryService.taskCategoryRetrieveAll(payload)
  }

  @Get(':id')
  @Permissions(PERMISSIONS.TASK_CATEGORY.READ)
  @ApiOperation({ summary: 'Task Category Retrieve One' })
  @ApiResponse({ status: 200, type: TaskCategoryResponseDto })
  async taskCategoryRetrieveOne(@Param('id') id: string) {
    return await this.taskCategoryService.taskCategoryRetrieveOne({ id })
  }

  @Post()
  @Permissions(PERMISSIONS.TASK_CATEGORY.CREATE)
  @ApiOperation({ summary: 'Task Category Create' })
  @ApiResponse({
    status: 201,
    description: 'Task category created successfully',
  })
  async taskCategoryCreate(
    @Body() payload: TaskCategoryCreateDto,
    @Req() req: any,
  ) {
    return await this.taskCategoryService.taskCategoryCreate({
      ...payload,
      createdBy: req.user?.userId,
    })
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.TASK_CATEGORY.UPDATE)
  @ApiOperation({ summary: 'Task Category Update' })
  @ApiResponse({
    status: 200,
    description: 'Task category updated successfully',
  })
  async taskCategoryUpdate(
    @Param('id') id: string,
    @Body() payload: TaskCategoryUpdateDto,
    @Req() req: any,
  ) {
    return await this.taskCategoryService.taskCategoryUpdate({
      id,
      ...payload,
      updatedBy: req.user?.userId,
    })
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.TASK_CATEGORY.DELETE)
  @ApiOperation({ summary: 'Task Category Delete' })
  @ApiResponse({
    status: 200,
    description: 'Task category deleted successfully',
  })
  async taskCategoryDelete(@Param('id') id: string, @Req() req: any) {
    return await this.taskCategoryService.taskCategoryDelete({
      id,
      deletedBy: req.user?.userId,
    })
  }
}
