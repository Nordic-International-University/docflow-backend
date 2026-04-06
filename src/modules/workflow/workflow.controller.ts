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

@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@ApiTags('Workflow')
@Controller({
  path: 'workflow',
  version: '1',
})
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get()
  @Permissions(PERMISSIONS.WORKFLOW.LIST)
  @ApiOperation({ summary: 'Workflow Retrieve All' })
  @ApiResponse({ status: 200, type: WorkflowListResponseDto })
  async workflowRetrieveAll(
    @Query() payload: WorkflowRetrieveAllDto,
    @Req() req: any,
  ) {
    return await this.workflowService.workflowRetrieveAll({
      ...payload,
      userId: req.user.userId,
      roleName: req.user.roleName,
    })
  }

  @Get(':id')
  @Permissions(PERMISSIONS.WORKFLOW.READ)
  @ApiOperation({ summary: 'Workflow Retrieve One' })
  @ApiResponse({ status: 200, type: WorkflowResponseDto })
  async workflowRetrieveOne(@Param('id') id: string, @Req() req: any) {
    return await this.workflowService.workflowRetrieveOne({
      id,
      userId: req.user.userId,
      roleName: req.user.roleName,
    })
  }

  @Post()
  @Permissions(PERMISSIONS.WORKFLOW.CREATE)
  @ApiOperation({ summary: 'Workflow Create' })
  @ApiResponse({ status: 201, description: 'Workflow created successfully' })
  async workflowCreate(@Body() payload: WorkflowCreateDto) {
    return await this.workflowService.workflowCreate(payload)
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
