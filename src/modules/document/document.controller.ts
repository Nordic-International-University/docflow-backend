import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ParseUUIDPipe,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common'
import { DocumentService } from './document.service'
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiForbiddenResponse,
} from '@nestjs/swagger'
import {
  DocumentCreateDto,
  DocumentUpdateDto,
  DocumentDeleteDto,
  DocumentResponseDto,
  DocumentListResponseDto,
  DocumentPublicVerificationDto,
} from './dtos'
import { AuthGuard, PermissionGuard } from '@guards'
import { Permissions, Public } from '@decorators'
import { PERMISSIONS } from '@constants'

@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@ApiTags('Document')
@Controller({ path: 'document', version: '1' })
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get()
  @Permissions(PERMISSIONS.DOCUMENT.LIST)
  @ApiOperation({
    summary: 'Retrieve all documents with pagination and search',
  })
  @ApiOkResponse({
    description: 'A paginated list of documents.',
    type: DocumentListResponseDto,
  })
  @ApiQuery({ name: 'pageNumber', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'documentTypeId', required: false, type: String })
  @ApiQuery({ name: 'journalId', required: false, type: String })
  @ApiQuery({ name: 'templateId', required: false, type: String })
  async documentRetrieveAll(
    @Query('pageNumber') pageNumber?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('documentTypeId') documentTypeId?: string,
    @Query('journalId') journalId?: string,
    @Query('templateId') templateId?: string,
    @Req() req?: any,
  ) {
    return await this.documentService.documentRetrieveAll({
      pageNumber,
      pageSize,
      search,
      status: status as any,
      documentTypeId,
      journalId,
      templateId,
      userId: req.user.userId,
      roleName: req.user.roleName,
    })
  }

  @Get(':id')
  @Permissions(PERMISSIONS.DOCUMENT.READ)
  @ApiOperation({ summary: 'Retrieve a single document by its ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the document',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'The requested document.',
    type: DocumentResponseDto,
  })
  async documentRetrieveOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
  ): Promise<any> {
    return await this.documentService.documentRetrieveOne({
      id,
      userId: req.user.userId,
      roleName: req.user.roleName,
    })
  }

  @Post()
  @Permissions(PERMISSIONS.DOCUMENT.CREATE)
  @ApiOperation({
    summary: 'Create a new document',
    description:
      "Creates a new document. If documentNumber is not provided, it will be auto-generated based on the journal's format configuration (e.g., {prefix}-{year}-{sequence}).",
  })
  @ApiCreatedResponse({
    description: 'The document has been successfully created.',
    type: DocumentResponseDto,
  })
  async documentCreate(
    @Body() payload: DocumentCreateDto,
    @Req() req: any,
  ): Promise<any> {
    console.log('req', req.user)
    return await this.documentService.documentCreate({
      userId: req.user.userId,
      ...payload,
    })
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.DOCUMENT.UPDATE)
  @ApiOperation({ summary: 'Update an existing document' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the document to update',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'The document has been successfully updated.',
    type: DocumentResponseDto,
  })
  async documentUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: DocumentUpdateDto,
  ): Promise<any> {
    return await this.documentService.documentUpdate({ id, ...payload })
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.DOCUMENT.DELETE)
  @ApiOperation({ summary: 'Delete a document' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the document to delete',
    type: 'string',
  })
  @ApiOkResponse({ description: 'The document has been successfully deleted.' })
  async documentDelete(
    @Param() params: DocumentDeleteDto,
    @Req() req: any,
  ): Promise<void> {
    return await this.documentService.documentDelete({
      ...params,
      userId: req.user.userId,
      roleName: req.user.roleName,
    })
  }

  @Post('create-with-office')
  @Permissions(PERMISSIONS.DOCUMENT.CREATE)
  @ApiOperation({
    summary: 'Hujjat yaratish va Collabora Office da ochish',
    description:
      'Bo\'sh Office hujjat yaratadi (docx/xlsx/pptx), attachment sifatida saqlaydi, document yaratadi va Collabora editor URL qaytaradi.',
  })
  async documentCreateWithOffice(
    @Body()
    body: {
      title: string
      description?: string
      documentTypeId: string
      journalId: string
      fileType?: 'docx' | 'xlsx' | 'pptx'
    },
    @Req() req: any,
  ) {
    return await this.documentService.documentCreateWithOffice({
      ...body,
      userId: req.user.userId,
    })
  }

  @Get(':id/pdf-url')
  @Permissions(PERMISSIONS.DOCUMENT.READ)
  @ApiOperation({ summary: 'Get PDF URL and XFDF content for a document' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the document',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'PDF URL and XFDF content (XML string) for the document.',
    schema: {
      type: 'object',
      properties: {
        pdfUrl: {
          type: 'string',
          nullable: true,
          description: 'URL to the PDF file',
        },
        xfdfUrl: {
          type: 'string',
          nullable: true,
          description: 'XFDF content as XML string (not a URL)',
        },
      },
    },
  })
  async documentGetPdfUrl(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ pdfUrl: string | null; xfdfUrl: string | null }> {
    return await this.documentService.documentGetPdfUrl(id)
  }

  @Post(':id/pdf-url')
  @Permissions(PERMISSIONS.DOCUMENT.UPDATE)
  @ApiOperation({
    summary: 'Update XFDF content for a document and merge with PDF',
    description:
      'Accepts XFDF content (XML string) and stores it in the database. Merges the annotations with the PDF and creates a new merged PDF. **IMPORTANT**: All users with an active workflow step (APPROVAL, SIGN, REVIEW, ACKNOWLEDGE, VERIFICATION) can perform this operation.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the document',
    type: 'string',
  })
  @ApiOkResponse({
    description:
      'The XFDF content has been successfully stored and merged with PDF.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'XFDF processed and merged successfully',
        },
      },
    },
  })
  @ApiForbiddenResponse({
    description:
      'User does not have an active workflow step permission to merge XFDF annotations.',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 403,
        },
        message: {
          type: 'string',
          example:
            'You do not have permission to edit XFDF annotations. Only users with an active workflow step can perform this action.',
        },
        error: {
          type: 'string',
          example: 'Forbidden',
        },
      },
    },
  })
  async documentUpdateXfdfUrl(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('xfdfUrl') xfdfContent: string,
    @Req() req: any,
  ): Promise<void> {
    return await this.documentService.documentUpdateXfdfUrl(
      id,
      xfdfContent,
      req.user.userId,
    )
  }

  @Public()
  @Get(':id/download')
  @ApiOperation({
    summary: 'Download accepted workflow document without watermark (Public)',
    description:
      'Downloads a PDF document after removing watermarks. Only available for documents with completed workflows and APPROVED status. The PDF will be cleaned of any Apryse watermarks before download. This endpoint does not require authentication.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the document to download',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'PDF file download',
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiForbiddenResponse({
    description:
      'Document workflow is not completed or document is not approved',
  })
  async documentDownload(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: any,
  ): Promise<void> {
    const { pdfBuffer, fileName } =
      await this.documentService.documentDownloadAccepted(id)

    // Set response headers for file download
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': pdfBuffer.length,
    })

    // Send the buffer
    res.send(pdfBuffer)
  }
}

@ApiTags('Document - Public')
@Controller({ path: 'public/document', version: '1' })
export class DocumentPublicController {
  constructor(private readonly documentService: DocumentService) {}

  @Get('verify/:id')
  @ApiOperation({
    summary: 'Public endpoint to verify document and view workflow status',
    description:
      'Retrieve document details with complete workflow information including who signed, approved, QR coded the document, and current status. This is a public endpoint that does not require authentication.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the document to verify',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description:
      'Document details with workflow information including all signatures, approvals, and current status.',
    type: DocumentPublicVerificationDto,
  })
  async documentPublicVerification(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DocumentPublicVerificationDto> {
    return await this.documentService.documentPublicVerification(id)
  }
}
