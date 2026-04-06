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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { WorkflowStepService } from './workflow-step.service'
import {
  WorkflowStepCreateDto,
  WorkflowStepDeleteDto,
  WorkflowStepListResponseDto,
  WorkflowStepResponseDto,
  WorkflowStepRetrieveAllDto,
  WorkflowStepUpdateDto,
  WorkflowStepRejectDto,
  WorkflowStepApproveDto,
  WorkflowStepVerifyDto,
  WorkflowStepCalendarDto,
  WorkflowStepCalendarListResponseDto,
} from './dtos'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger'
import { AuthGuard, PermissionGuard } from '@guards'
import { Permissions } from '@decorators'
import { PERMISSIONS } from '@constants'

@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@ApiTags('Workflow Step')
@Controller({
  path: 'workflow-step',
  version: '1',
})
export class WorkflowStepController {
  constructor(private readonly workflowStepService: WorkflowStepService) {}

  @Get()
  @Permissions(PERMISSIONS.WORKFLOW_STEP.LIST)
  @ApiOperation({ summary: 'Workflow Step Retrieve All' })
  @ApiResponse({ status: 200, type: WorkflowStepListResponseDto })
  async workflowStepRetrieveAll(
    @Query() payload: WorkflowStepRetrieveAllDto,
    @Req() req: any,
  ) {
    return await this.workflowStepService.workflowStepRetrieveAll({
      ...payload,
      userId: req.user.userId,
      roleName: req.user.roleName,
    })
  }

  @Get(':id')
  @Permissions(PERMISSIONS.WORKFLOW_STEP.READ)
  @ApiOperation({ summary: 'Workflow Step Retrieve One' })
  @ApiResponse({ status: 200, type: WorkflowStepResponseDto })
  async workflowStepRetrieveOne(@Param('id') id: string, @Req() req: any) {
    return await this.workflowStepService.workflowStepRetrieveOne({
      id,
      userId: req.user.userId,
      roleName: req.user.roleName,
    })
  }

  @Post()
  @Permissions(PERMISSIONS.WORKFLOW_STEP.CREATE)
  @ApiOperation({ summary: 'Workflow Step Create' })
  @ApiResponse({
    status: 201,
    description: 'Workflow Step created successfully',
  })
  async workflowStepCreate(
    @Body() payload: WorkflowStepCreateDto,
    @Req() req: any,
  ) {
    return await this.workflowStepService.workflowStepCreate(
      payload,
      req.user.userId,
    )
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.WORKFLOW_STEP.UPDATE)
  @ApiOperation({ summary: 'Workflow Step Update' })
  @ApiResponse({
    status: 200,
    description: 'Workflow Step updated successfully',
  })
  async workflowStepUpdate(
    @Param('id') id: string,
    @Body() payload: WorkflowStepUpdateDto,
    @Req() req: any,
  ) {
    return await this.workflowStepService.workflowStepUpdate({
      id,
      ...payload,
      userId: req.user.userId,
    })
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.WORKFLOW_STEP.DELETE)
  @ApiOperation({ summary: 'Workflow Step Delete' })
  @ApiResponse({
    status: 200,
    description: 'Workflow Step deleted successfully',
  })
  async workflowStepDelete(@Param('id') id: string, @Req() req: any) {
    return await this.workflowStepService.workflowStepDelete({
      id,
      userId: req.user.userId,
    })
  }

  // Additional endpoints specific to WorkflowStep functionality
  @Get('workflow/:workflowId')
  @Permissions(PERMISSIONS.WORKFLOW_STEP.LIST)
  @ApiOperation({ summary: 'Get Steps by Workflow ID' })
  @ApiResponse({ status: 200, type: WorkflowStepListResponseDto })
  async getStepsByWorkflow(
    @Param('workflowId') workflowId: string,
    @Req() req: any,
  ) {
    return await this.workflowStepService.getStepsByWorkflow({
      workflowId,
      userId: req.user.userId,
    })
  }

  @Patch(':id/assign')
  @Permissions(PERMISSIONS.WORKFLOW_STEP.UPDATE)
  @ApiOperation({ summary: 'Assign Workflow Step to User' })
  @ApiResponse({
    status: 200,
    description: 'Workflow Step assigned successfully',
  })
  async assignStepToUser(
    @Param('id') id: string,
    @Body() payload: { assignedToUserId: string },
    @Req() req: any,
  ) {
    return await this.workflowStepService.assignStepToUser({
      id,
      ...payload,
      assignedByUserId: req.user.userId,
    })
  }

  @Patch(':id/complete')
  @Permissions(PERMISSIONS.WORKFLOW_STEP.COMPLETE)
  @ApiParam({
    name: 'id',
    description: 'Workflow Step ID',
    type: String,
  })
  @ApiBody({ type: WorkflowStepApproveDto })
  @ApiOperation({
    summary: 'Complete Workflow Step',
    description:
      'Marks the workflow step as completed and advances the workflow to the next step. Only the assigned user can complete their step.',
  })
  @ApiResponse({
    status: 200,
    description: 'Workflow Step completed successfully',
    type: WorkflowStepResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Step already completed or not current step',
  })
  @ApiResponse({
    status: 404,
    description: 'Workflow Step not found',
  })
  async completeStep(
    @Param('id') id: string,
    @Body() payload: WorkflowStepApproveDto,
    @Req() req: any,
  ) {
    return await this.workflowStepService.completeStep({
      id,
      ...payload,
      userId: req.user.userId,
    })
  }

  @Post(':id/verify')
  @Permissions(PERMISSIONS.WORKFLOW_STEP.COMPLETE)
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiParam({
    name: 'id',
    description: 'Workflow Step ID',
    type: String,
  })
  @ApiOperation({
    summary: 'Verify Workflow Step with File Uploads',
    description:
      'Completes a VERIFICATION type workflow step by uploading file attachments as proof of work. This endpoint accepts multiple files and an optional comment. At least one file is required. Only the assigned user can verify their step. VERIFICATION steps cannot be rejected or rolled back.',
  })
  @ApiResponse({
    status: 200,
    description: 'Workflow Step verified successfully',
    type: WorkflowStepResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Not a VERIFICATION step, no files provided, step already completed, or not current step',
  })
  @ApiResponse({
    status: 404,
    description: 'Workflow Step not found',
  })
  async verifyStep(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() payload: WorkflowStepVerifyDto,
    @Req() req: any,
  ) {
    return await this.workflowStepService.verifyStep({
      id,
      files,
      comment: payload.comment,
      userId: req.user.userId,
    })
  }

  @Patch(':id/reject')
  @Permissions(PERMISSIONS.WORKFLOW_STEP.UPDATE)
  @ApiParam({
    name: 'id',
    description: 'Workflow Step ID',
    type: String,
  })
  @ApiBody({ type: WorkflowStepRejectDto })
  @ApiOperation({
    summary: 'Reject Workflow Step',
    description:
      'Marks the workflow step as rejected. You can either: 1) Set rejectToCreator=true to send the workflow back to the creator for review (works for all workflow types), or 2) Specify rollbackToUserId to rollback to a previous user for re-review (only works for CONSECUTIVE workflows). When rollback/reject to creator is specified, the workflow resets to that step.',
  })
  @ApiResponse({
    status: 200,
    description: 'Workflow Step rejected successfully',
    type: WorkflowStepResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Invalid rollback user, not a CONSECUTIVE workflow, or not current step',
  })
  @ApiResponse({
    status: 404,
    description: 'Workflow Step or rollback user not found',
  })
  async rejectStep(
    @Param('id') id: string,
    @Body() payload: WorkflowStepRejectDto,
    @Req() req: any,
  ) {
    return await this.workflowStepService.rejectStep({
      id,
      ...payload,
      userId: req.user.userId,
    })
  }

  @Get('calendar/view')
  @Permissions(PERMISSIONS.WORKFLOW_STEP.LIST)
  @ApiOperation({
    summary: 'Get Workflow Steps Calendar View',
    description:
      'Returns workflow steps assigned to the current user organized by date. Useful for displaying tasks in a calendar format. If no date range is provided, defaults to the current month.',
  })
  @ApiResponse({
    status: 200,
    description: 'Calendar view retrieved successfully',
    type: WorkflowStepCalendarListResponseDto,
  })
  async getCalendarView(
    @Query() payload: WorkflowStepCalendarDto,
    @Req() req: any,
  ) {
    return await this.workflowStepService.getCalendarView({
      ...payload,
      userId: req.user.userId,
    })
  }
}
