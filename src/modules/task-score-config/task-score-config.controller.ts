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
import { TaskScoreConfigService } from './task-score-config.service'
import {
  TaskScoreConfigCreateDto,
  TaskScoreConfigUpdateDto,
  TaskScoreConfigRetrieveQueryDto,
} from './dtos'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { AuthGuard, PermissionGuard } from '@guards'
import { Permissions } from '@decorators'
import { PERMISSIONS } from '@constants'

@ApiBearerAuth()
@ApiTags('Task Score Config')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'task-score-config',
  version: '1',
})
export class TaskScoreConfigController {
  constructor(
    private readonly taskScoreConfigService: TaskScoreConfigService,
  ) {}

  @Get()
  @Permissions(PERMISSIONS.TASK_SCORE_CONFIG.LIST)
  @ApiOperation({ summary: 'Get all task score configurations' })
  @ApiResponse({
    status: 200,
    description: 'List of task score configurations',
  })
  async taskScoreConfigRetrieveAll(
    @Query() payload: TaskScoreConfigRetrieveQueryDto,
  ) {
    return await this.taskScoreConfigService.taskScoreConfigRetrieveAll(payload)
  }

  @Get(':id')
  @Permissions(PERMISSIONS.TASK_SCORE_CONFIG.READ)
  @ApiOperation({ summary: 'Get task score configuration by ID' })
  @ApiResponse({ status: 200, description: 'Task score configuration' })
  async taskScoreConfigRetrieveOne(@Param('id') id: string) {
    return await this.taskScoreConfigService.taskScoreConfigRetrieveOne(id)
  }

  @Get('priority/:priorityLevel')
  @Permissions(PERMISSIONS.TASK_SCORE_CONFIG.READ)
  @ApiOperation({ summary: 'Get task score configuration by priority level' })
  @ApiResponse({ status: 200, description: 'Task score configuration' })
  async taskScoreConfigRetrieveByPriority(
    @Param('priorityLevel') priorityLevel: string,
  ) {
    return await this.taskScoreConfigService.taskScoreConfigRetrieveByPriority(
      parseInt(priorityLevel, 10),
    )
  }

  @Post()
  @Permissions(PERMISSIONS.TASK_SCORE_CONFIG.CREATE)
  @ApiOperation({ summary: 'Create a new task score configuration' })
  @ApiResponse({ status: 201, description: 'Task score configuration created' })
  async taskScoreConfigCreate(
    @Body() payload: TaskScoreConfigCreateDto,
    @Req() req: any,
  ) {
    return await this.taskScoreConfigService.taskScoreConfigCreate({
      ...payload,
      createdBy: req.user.userId,
    })
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.TASK_SCORE_CONFIG.UPDATE)
  @ApiOperation({ summary: 'Update a task score configuration' })
  @ApiResponse({ status: 200, description: 'Task score configuration updated' })
  async taskScoreConfigUpdate(
    @Param('id') id: string,
    @Body() payload: TaskScoreConfigUpdateDto,
    @Req() req: any,
  ) {
    return await this.taskScoreConfigService.taskScoreConfigUpdate({
      id,
      ...payload,
      updatedBy: req.user.userId,
    })
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.TASK_SCORE_CONFIG.DELETE)
  @ApiOperation({ summary: 'Delete a task score configuration' })
  @ApiResponse({ status: 200, description: 'Task score configuration deleted' })
  async taskScoreConfigDelete(@Param('id') id: string) {
    return await this.taskScoreConfigService.taskScoreConfigDelete(id)
  }
}
