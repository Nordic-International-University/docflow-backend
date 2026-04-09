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
import { DocumentTemplateService } from './document-template.service'
import {
  DocumentTemplateCreateDto,
  DocumentTemplateUpdateDto,
  DocumentTemplateDeleteDto,
  DocumentTemplateRetrieveAllDto,
} from './dtos'
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger'
import { AuthGuard, PermissionGuard } from '@guards'
import { Permissions } from '@decorators'
import { PERMISSIONS } from '@constants'

@ApiBearerAuth()
@ApiTags('Document Template')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'document-template',
  version: '1',
})
export class DocumentTemplateController {
  constructor(
    private readonly documentTemplateService: DocumentTemplateService,
  ) {}

  @Get()
  @Permissions(PERMISSIONS.DOCUMENT_TEMPLATE.LIST)
  @ApiOperation({ summary: 'Retrieve all document templates' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved document templates',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              isActive: { type: 'boolean' },
              isPublic: { type: 'boolean' },
              documentType: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                },
              },
              templateFile: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  fileName: { type: 'string' },
                  fileSize: { type: 'string' },
                  fileUrl: { type: 'string' },
                  mimeType: { type: 'string' },
                },
              },
            },
          },
        },
        count: { type: 'number' },
        pageNumber: { type: 'number' },
        pageSize: { type: 'number' },
        pageCount: { type: 'number' },
      },
    },
  })
  async documentTemplateRetrieveAll(
    @Query() payload: DocumentTemplateRetrieveAllDto,
  ) {
    return await this.documentTemplateService.documentTemplateRetrieveAll(
      payload,
    )
  }

  @Get(':id')
  @Permissions(PERMISSIONS.DOCUMENT_TEMPLATE.READ)
  @ApiOperation({ summary: 'Retrieve a single document template' })
  @ApiParam({ name: 'id', type: String, description: 'Document template ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved document template',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string', nullable: true },
        isActive: { type: 'boolean' },
        documentType: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
          },
        },
        templateFile: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            fileName: { type: 'string' },
            fileSize: { type: 'string' },
            fileUrl: { type: 'string' },
            mimeType: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Document template not found',
  })
  async documentTemplateRetrieveOne(@Param('id') id: string) {
    return await this.documentTemplateService.documentTemplateRetrieveOne({
      id,
    })
  }

  @Post()
  @Permissions(PERMISSIONS.DOCUMENT_TEMPLATE.CREATE)
  @ApiOperation({ summary: 'Create a new document template' })
  @ApiBody({ type: DocumentTemplateCreateDto })
  @ApiResponse({
    status: 201,
    description: 'Document template created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async documentTemplateCreate(
    @Body() payload: DocumentTemplateCreateDto,
    @Req() req: any,
  ) {
    return await this.documentTemplateService.documentTemplateCreate({
      ...payload,
      createdBy: req.user?.userId,
    })
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.DOCUMENT_TEMPLATE.UPDATE)
  @ApiOperation({ summary: 'Update a document template' })
  @ApiParam({ name: 'id', type: String, description: 'Document template ID' })
  @ApiBody({ type: DocumentTemplateUpdateDto })
  @ApiResponse({
    status: 200,
    description: 'Document template updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string', nullable: true },
        isActive: { type: 'boolean' },
        documentType: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
          },
        },
        templateFile: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            fileName: { type: 'string' },
            fileSize: { type: 'string' },
            fileUrl: { type: 'string' },
            mimeType: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Document template not found',
  })
  async documentTemplateUpdate(
    @Param('id') id: string,
    @Body() payload: DocumentTemplateUpdateDto,
    @Req() req: any,
  ) {
    return await this.documentTemplateService.documentTemplateUpdate({
      id,
      ...payload,
      updatedBy: req.user?.userId,
    })
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.DOCUMENT_TEMPLATE.DELETE)
  @ApiOperation({ summary: 'Delete a document template' })
  @ApiParam({ name: 'id', type: String, description: 'Document template ID' })
  @ApiResponse({
    status: 200,
    description: 'Document template deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Document template not found',
  })
  async documentTemplateDelete(@Param('id') id: string, @Req() req: any) {
    return await this.documentTemplateService.documentTemplateDelete({
      id,
      deletedBy: req.user?.userId,
    })
  }
}
