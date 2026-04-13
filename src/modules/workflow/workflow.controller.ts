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
import type { AuthenticatedRequest } from '../../common/types/request.types'
import { WorkflowService } from './workflow.service'
import {
  WorkflowCreateDto,
  WorkflowDeleteDto,
  WorkflowListResponseDto,
  WorkflowResponseDto,
  WorkflowRetrieveAllDto,
  WorkflowUpdateDto,
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
import { PoliciesGuard, CheckPolicies } from '../../casl'

@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard, PoliciesGuard)
@ApiTags('Workflow')
@Controller({
  path: 'workflow',
  version: '1',
})
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get()
  @Permissions(PERMISSIONS.WORKFLOW.LIST)
  @CheckPolicies((ability) => ability.can('read', 'Workflow'))
  @ApiOperation({ summary: 'Workflow Retrieve All' })
  @ApiResponse({ status: 200, type: WorkflowListResponseDto })
  async workflowRetrieveAll(
    @Query() payload: WorkflowRetrieveAllDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.workflowService.workflowRetrieveAll({
      ...payload,
      userId: req.user.userId,
      roleName: req.user.roleName,
      ability: req.ability,
    })
  }

  @Get(':id')
  @Permissions(PERMISSIONS.WORKFLOW.READ)
  @CheckPolicies((ability) => ability.can('read', 'Workflow'))
  @ApiOperation({ summary: 'Workflow Retrieve One' })
  @ApiResponse({ status: 200, type: WorkflowResponseDto })
  async workflowRetrieveOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return await this.workflowService.workflowRetrieveOne({
      id,
      userId: req.user.userId,
      roleName: req.user.roleName,
      ability: req.ability,
    })
  }

  @Post()
  @Permissions(PERMISSIONS.WORKFLOW.CREATE)
  @CheckPolicies((ability) => ability.can('create', 'Workflow'))
  @ApiOperation({ summary: 'Workflow Create' })
  @ApiResponse({ status: 201, description: 'Workflow created successfully' })
  async workflowCreate(@Body() payload: WorkflowCreateDto, @Req() req: AuthenticatedRequest) {
    return await this.workflowService.workflowCreate(payload, req.user.userId, req.user.roleName)
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.WORKFLOW.UPDATE)
  @ApiOperation({ summary: 'Workflow Update' })
  @ApiResponse({ status: 200, description: 'Workflow updated successfully' })
  async workflowUpdate(
    @Param('id') id: string,
    @Body() payload: WorkflowUpdateDto,
  ) {
    return await this.workflowService.workflowUpdate({
      id,
      ...payload,
    })
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.WORKFLOW.DELETE)
  @ApiOperation({ summary: 'Workflow Delete' })
  @ApiResponse({ status: 200, description: 'Workflow deleted successfully' })
  async workflowDelete(@Param('id') id: string) {
    return await this.workflowService.workflowDelete({ id })
  }
}
