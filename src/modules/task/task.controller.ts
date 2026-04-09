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
import { TaskService } from './task.service'
import { TaskCreateDto, TaskUpdateDto, TaskRetrieveQueryDto } from './dtos'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthGuard, PermissionGuard } from '@guards'
import { Permissions } from '@decorators'
import { PERMISSIONS } from '@constants'

@ApiBearerAuth()
@ApiTags('Task')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'task',
  version: '1',
})
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  @Permissions(PERMISSIONS.TASK.LIST)
  async taskRetrieveAll(
    @Query() payload: TaskRetrieveQueryDto,
    @Req() req: any,
  ) {
    return await this.taskService.taskRetrieveAll({
      ...payload,
      userId: req.user.userId,
      roleName: req.user.roleName,
      userDepartmentId: req.user.departmentId,
    })
  }

  @Get(':id')
  @Permissions(PERMISSIONS.TASK.READ)
  async taskRetrieveOne(@Param('id') id: string) {
    return await this.taskService.taskRetrieveOne({ id })
  }

  @Post()
  @Permissions(PERMISSIONS.TASK.CREATE)
  async taskCreate(@Body() payload: TaskCreateDto, @Req() req: any) {
    return await this.taskService.taskCreate({
      ...payload,
      createdById: req.user.userId,
    })
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.TASK.UPDATE)
  async taskUpdate(
    @Param('id') id: string,
    @Body() payload: TaskUpdateDto,
    @Req() req: any,
  ) {
    return await this.taskService.taskUpdate({
      id,
      ...payload,
      updatedBy: req.user.userId,
    })
  }

  @Post(':id/complete')
  @Permissions(PERMISSIONS.TASK.COMPLETE)
  @ApiOperation({ summary: 'Topshiriqni yakunlash — KPI hisoblanadi' })
  async taskComplete(@Param('id') id: string, @Req() req: any) {
    return await this.taskService.taskComplete({
      id,
      completedBy: req.user.userId,
    })
  }

  @Post(':id/uncomplete')
  @Permissions(PERMISSIONS.TASK.COMPLETE)
  @ApiOperation({ summary: 'Topshiriqni qayta ochish — KPI bekor qilinadi' })
  async taskUncomplete(@Param('id') id: string, @Req() req: any) {
    return await this.taskService.taskUncomplete({
      id,
      reopenedBy: req.user.userId,
    })
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.TASK.DELETE)
  async taskDelete(@Param('id') id: string, @Req() req: any) {
    return await this.taskService.taskDelete({ id, deletedBy: req.user.userId })
  }
}
