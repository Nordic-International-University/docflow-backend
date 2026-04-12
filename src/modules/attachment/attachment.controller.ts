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
import { isAdmin } from '@common/helpers'
import { AttachmentService } from './attachment.service'
import {
  AttachmentCreateDto,
  AttachmentDeleteDto,
  AttachmentListResponseDto,
  AttachmentResponseDto,
  AttachmentRetrieveAllDto,
  AttachmentUpdateDto,
} from './dtos'
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import { AuthGuard, PermissionGuard } from '@guards'
import { Permissions } from '@decorators'
import { PERMISSIONS } from '@constants'

@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@ApiTags('Attachment')
@Controller({
  path: 'attachment',
  version: '1',
})
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Get()
  @Permissions(PERMISSIONS.ATTACHMENT.LIST)
  @ApiOperation({ summary: 'Attachment Retrieve All' })
  @ApiResponse({ status: 200, type: AttachmentListResponseDto })
  async attachmentRetrieveAll(
    @Query() payload: AttachmentRetrieveAllDto,
    @Req() req: any,
  ) {
    return await this.attachmentService.attachmentRetrieveAll({
      ...payload,
      userId: req.user.userId,
      roleName: req.user.roleName,
    })
  }

  @Get(':id')
  @Permissions(PERMISSIONS.ATTACHMENT.READ)
  @ApiOperation({ summary: 'Attachment Retrieve One' })
  @ApiResponse({ status: 200, type: AttachmentResponseDto })
  async attachmentRetrieveOne(@Param('id') id: string, @Req() req: any) {
    return await this.attachmentService.attachmentRetrieveOne({
      id,
      userId: req.user.userId,
      roleName: req.user.roleName,
    })
  }

  @Post()
  @Permissions(PERMISSIONS.ATTACHMENT.UPLOAD)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Attachment Create' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Attachment created successfully' })
  async attachmentCreate(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    return await this.attachmentService.attachmentCreate({
      file,
      uploadedById: req.user.userId,
    })
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.ATTACHMENT.READ)
  @ApiOperation({ summary: 'Attachment Update' })
  @ApiResponse({ status: 200, description: 'Attachment updated successfully' })
  async attachmentUpdate(
    @Param('id') id: string,
    @Body() payload: AttachmentUpdateDto,
  ) {
    return await this.attachmentService.attachmentUpdate({
      id,
      ...payload,
    })
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.ATTACHMENT.DELETE)
  @ApiOperation({ summary: 'Attachment Delete' })
  @ApiResponse({ status: 200, description: 'Attachment deleted successfully' })
  async attachmentDelete(@Param('id') id: string) {
    return await this.attachmentService.attachmentDelete({ id })
  }

  @Post('repair-filenames')
  @Permissions(PERMISSIONS.ATTACHMENT.LIST)
  @ApiOperation({
    summary: 'Repair Cyrillic Filenames',
    description:
      'Fixes existing attachment filenames that have mangled Cyrillic characters. Only accessible to administrators.',
  })
  @ApiResponse({
    status: 200,
    description: 'Filename repair completed',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: 'Total attachments checked' },
        fixed: { type: 'number', description: 'Number of filenames fixed' },
        unchanged: {
          type: 'number',
          description: 'Number of filenames that were already correct',
        },
        errors: {
          type: 'number',
          description: 'Number of errors encountered',
        },
        details: {
          type: 'array',
          description: 'List of fixed filenames',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              oldName: { type: 'string' },
              newName: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async repairFilenames(@Req() req: any) {
    // Only allow super admin or admin to run this
    if (!isAdmin(req.user.roleName)) {
      throw new Error('Only administrators can repair filenames')
    }

    return await this.attachmentService.repairExistingFilenames()
  }
}
