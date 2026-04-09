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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { TaskAttachmentService } from './task-attachment.service'
import { AttachmentService } from '../attachment/attachment.service'
import {
  TaskAttachmentCreateDto,
  TaskAttachmentUpdateDto,
  TaskAttachmentRetrieveQueryDto,
  TaskAttachmentListResponseDto,
  TaskAttachmentResponseDto,
} from './dtos'
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import { AuthGuard, PermissionGuard } from '@guards'
import { Permissions } from '@decorators'
import { PERMISSIONS } from '@constants'

@ApiBearerAuth()
@ApiTags('Task Attachment')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'task-attachment',
  version: '1',
})
export class TaskAttachmentController {
  constructor(
    private readonly taskAttachmentService: TaskAttachmentService,
    private readonly attachmentService: AttachmentService,
  ) {}

  @Get()
  @Permissions(PERMISSIONS.TASK.UPDATE)
  @ApiOperation({ summary: 'Task Attachment Retrieve All' })
  @ApiQuery({ name: 'pageNumber', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @ApiQuery({ name: 'taskId', required: false, type: String })
  @ApiResponse({ status: 200, type: TaskAttachmentListResponseDto })
  async taskAttachmentRetrieveAll(
    @Query() payload: TaskAttachmentRetrieveQueryDto,
  ) {
    return await this.taskAttachmentService.taskAttachmentRetrieveAll(payload)
  }

  @Get(':id')
  @Permissions(PERMISSIONS.TASK.UPDATE)
  @ApiOperation({ summary: 'Task Attachment Retrieve One' })
  @ApiResponse({ status: 200, type: TaskAttachmentResponseDto })
  async taskAttachmentRetrieveOne(@Param('id') id: string) {
    return await this.taskAttachmentService.taskAttachmentRetrieveOne({ id })
  }

  @Post('upload')
  @Permissions(PERMISSIONS.TASK.UPDATE)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload file and attach to task' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'taskId'],
      properties: {
        file: { type: 'string', format: 'binary' },
        taskId: { type: 'string' },
        description: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded and attached to task',
  })
  async taskAttachmentUpload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { taskId: string; description?: string },
    @Req() req: any,
  ) {
    // Step 1: Upload file to attachment
    const attachment = await this.attachmentService.attachmentCreate({
      file,
      uploadedById: req.user?.userId,
    })

    // Step 2: Link attachment to task
    await this.taskAttachmentService.taskAttachmentCreate({
      taskId: body.taskId,
      attachmentId: attachment.id,
      uploadedById: req.user?.userId,
      description: body.description,
    })

    return {
      id: attachment.id,
      fileName: attachment.fileName,
      fileUrl: attachment.fileUrl,
      fileSize: attachment.fileSize,
      mimeType: attachment.mimeType,
      taskId: body.taskId,
    }
  }

  @Post()
  @Permissions(PERMISSIONS.TASK.UPDATE)
  @ApiOperation({
    summary: 'Task Attachment Create (link existing attachment)',
  })
  @ApiResponse({
    status: 201,
    description: 'Task attachment created successfully',
  })
  async taskAttachmentCreate(
    @Body() payload: TaskAttachmentCreateDto,
    @Req() req: any,
  ) {
    return await this.taskAttachmentService.taskAttachmentCreate({
      ...payload,
      uploadedById: req.user?.userId,
    })
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.TASK.UPDATE)
  @ApiOperation({ summary: 'Task Attachment Update' })
  @ApiResponse({
    status: 200,
    description: 'Task attachment updated successfully',
  })
  async taskAttachmentUpdate(
    @Param('id') id: string,
    @Body() payload: TaskAttachmentUpdateDto,
    @Req() req: any,
  ) {
    return await this.taskAttachmentService.taskAttachmentUpdate({
      id,
      ...payload,
      updatedBy: req.user?.userId,
    })
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.TASK.UPDATE)
  @ApiOperation({ summary: 'Task Attachment Delete' })
  @ApiResponse({
    status: 200,
    description: 'Task attachment deleted successfully',
  })
  async taskAttachmentDelete(@Param('id') id: string, @Req() req: any) {
    return await this.taskAttachmentService.taskAttachmentDelete({
      id,
      deletedBy: req.user?.userId,
    })
  }
}
