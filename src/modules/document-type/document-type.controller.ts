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
import { DocumentTypeService } from './document-type.service'
import {
  DocumentTypeCreateDto,
  DocumentTypeDeleteDto,
  DocumentTypeListResponseDto,
  DocumentTypeResponseDto,
  DocumentTypeUpdateDto,
} from './dtos'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import {
  DocumentTypeRetrieveAllRequest,
  DocumentTypeRetrieveOneRequest,
} from './interfaces'
import { AuthGuard, PermissionGuard } from '@guards'
import { Permissions } from '@decorators'
import { PERMISSIONS } from '@constants'

@ApiBearerAuth()
@ApiTags('Document Type')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'document-type',
  version: '1',
})
export class DocumentTypeController {
  constructor(private readonly documentTypeService: DocumentTypeService) {}

  @Get()
  @Permissions(PERMISSIONS.DOCUMENT_TYPE.LIST)
  @ApiOperation({ summary: 'Document Type Retrieve All' })
  @ApiQuery({ name: 'pageNumber', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, type: DocumentTypeListResponseDto })
  async documentTypeRetrieveAll(
    @Query() payload: DocumentTypeRetrieveAllRequest,
  ) {
    return await this.documentTypeService.documentTypeRetrieveAll(payload)
  }

  @Get(':id')
  @Permissions(PERMISSIONS.DOCUMENT_TYPE.READ)
  @ApiOperation({ summary: 'Document Type Retrieve One' })
  @ApiResponse({ status: 200, type: DocumentTypeResponseDto })
  async documentTypeRetrieveOne(@Param('id') id: string) {
    return await this.documentTypeService.documentTypeRetrieveOne({ id })
  }

  @Post()
  @Permissions(PERMISSIONS.DOCUMENT_TYPE.CREATE)
  @ApiOperation({ summary: 'Document Type Create' })
  @ApiResponse({
    status: 201,
    description: 'Document type created successfully',
  })
  async documentTypeCreate(@Body() payload: DocumentTypeCreateDto, @Req() req: any) {
    return await this.documentTypeService.documentTypeCreate({ ...payload, createdBy: req.user?.userId })
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.DOCUMENT_TYPE.UPDATE)
  @ApiOperation({ summary: 'Document Type Update' })
  @ApiResponse({
    status: 200,
    description: 'Document type updated successfully',
  })
  async documentTypeUpdate(
    @Param('id') id: string,
    @Body() payload: DocumentTypeUpdateDto,
    @Req() req: any,
  ) {
    return await this.documentTypeService.documentTypeUpdate({
      id,
      ...payload,
      updatedBy: req.user?.userId,
    })
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.DOCUMENT_TYPE.DELETE)
  @ApiOperation({ summary: 'Document Type Delete' })
  @ApiResponse({
    status: 200,
    description: 'Document type deleted successfully',
  })
  async documentTypeDelete(@Param('id') id: string, @Req() req: any) {
    return await this.documentTypeService.documentTypeDelete({ id, deletedBy: req.user?.userId })
  }
}
