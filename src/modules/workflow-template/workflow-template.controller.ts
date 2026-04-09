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
import { WorkflowTemplateService } from './workflow-template.service'
import {
  WorkflowTemplateCreateDto,
  WorkflowTemplateUpdateDto,
  WorkflowTemplateRetrieveAllDto,
  WorkflowTemplateResponseDto,
  WorkflowTemplateListResponseDto,
} from './dtos'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { AuthGuard, PermissionGuard } from '@guards'
import { Permissions } from '@decorators'
import { PERMISSIONS } from '@constants'

@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@ApiTags('Workflow Template')
@Controller({
  path: 'workflow-template',
  version: '1',
})
export class WorkflowTemplateController {
  constructor(
    private readonly workflowTemplateService: WorkflowTemplateService,
  ) {}

  @Get()
  @Permissions(PERMISSIONS.WORKFLOW_TEMPLATE.LIST)
  @ApiOperation({ summary: 'Retrieve all workflow templates' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved workflow templates',
    type: WorkflowTemplateListResponseDto,
  })
  async workflowTemplateRetrieveAll(
    @Query() payload: WorkflowTemplateRetrieveAllDto,
  ) {
    return await this.workflowTemplateService.workflowTemplateRetrieveAll(
      payload,
    )
  }

  @Get(':id')
  @Permissions(PERMISSIONS.WORKFLOW_TEMPLATE.READ)
  @ApiOperation({ summary: 'Retrieve a single workflow template' })
  @ApiParam({ name: 'id', type: String, description: 'Workflow template ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved workflow template',
    type: WorkflowTemplateResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Workflow template not found',
  })
  async workflowTemplateRetrieveOne(@Param('id') id: string) {
    return await this.workflowTemplateService.workflowTemplateRetrieveOne({
      id,
    })
  }

  @Post()
  @Permissions(PERMISSIONS.WORKFLOW_TEMPLATE.CREATE)
  @ApiOperation({ summary: 'Create a new workflow template' })
  @ApiBody({ type: WorkflowTemplateCreateDto })
  @ApiResponse({
    status: 201,
    description: 'Workflow template created successfully',
    type: WorkflowTemplateResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'Workflow template with this name already exists',
  })
  async workflowTemplateCreate(
    @Body() payload: WorkflowTemplateCreateDto,
    @Req() req: any,
  ) {
    return await this.workflowTemplateService.workflowTemplateCreate({
      ...payload,
      createdBy: req.user?.userId,
    })
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.WORKFLOW_TEMPLATE.UPDATE)
  @ApiOperation({ summary: 'Update a workflow template' })
  @ApiParam({ name: 'id', type: String, description: 'Workflow template ID' })
  @ApiBody({ type: WorkflowTemplateUpdateDto })
  @ApiResponse({
    status: 200,
    description: 'Workflow template updated successfully',
    type: WorkflowTemplateResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Workflow template not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Workflow template with this name already exists',
  })
  async workflowTemplateUpdate(
    @Param('id') id: string,
    @Body() payload: WorkflowTemplateUpdateDto,
    @Req() req: any,
  ) {
    return await this.workflowTemplateService.workflowTemplateUpdate({
      id,
      ...payload,
      updatedBy: req.user?.userId,
    })
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.WORKFLOW_TEMPLATE.DELETE)
  @ApiOperation({ summary: 'Delete a workflow template' })
  @ApiParam({ name: 'id', type: String, description: 'Workflow template ID' })
  @ApiResponse({
    status: 200,
    description: 'Workflow template deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Workflow template not found',
  })
  async workflowTemplateDelete(@Param('id') id: string, @Req() req: any) {
    return await this.workflowTemplateService.workflowTemplateDelete({
      id,
      deletedBy: req.user?.userId,
    })
  }
}
