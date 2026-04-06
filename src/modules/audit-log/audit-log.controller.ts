import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common'
import { AuditLogService } from './audit-log.service'
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'
import {
  AuditLogCreateDto,
  AuditLogRetrieveAllDto,
  AuditLogResponseDto,
  AuditLogListResponseDto,
} from './dtos'
import { AuthGuard, PermissionGuard } from '@guards'
import { Permissions } from '@decorators'
import { PERMISSIONS } from '@constants'

@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@ApiTags('AuditLog')
@Controller({ path: 'audit-log', version: '1' })
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Permissions(PERMISSIONS.AUDIT_LOG.LIST)
  @ApiOperation({
    summary: 'Retrieve all audit logs with pagination and filtering',
  })
  @ApiOkResponse({
    description: 'A paginated list of audit logs.',
    type: AuditLogListResponseDto,
  })
  @ApiQuery({ name: 'pageNumber', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'entity', required: false, type: String })
  @ApiQuery({ name: 'entityId', required: false, type: String })
  @ApiQuery({ name: 'action', required: false, type: String })
  @ApiQuery({ name: 'performedByUserId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async auditLogRetrieveAll(
    @Query() payload: AuditLogRetrieveAllDto,
  ): Promise<any> {
    return await this.auditLogService.auditLogRetrieveAll(payload)
  }

  @Get(':id')
  @Permissions(PERMISSIONS.AUDIT_LOG.READ)
  @ApiOperation({ summary: 'Retrieve a single audit log entry by its ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the audit log entry',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'The requested audit log entry.',
    type: AuditLogResponseDto,
  })
  async auditLogRetrieveOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<any> {
    return await this.auditLogService.auditLogRetrieveOne({ id })
  }

  @Post()
  @Permissions(PERMISSIONS.AUDIT_LOG.CREATE)
  @ApiOperation({ summary: 'Create a new audit log entry' })
  @ApiCreatedResponse({
    description: 'The audit log entry has been successfully created.',
  })
  async auditLogCreate(@Body() payload: AuditLogCreateDto): Promise<void> {
    return await this.auditLogService.auditLogCreate(payload)
  }
}
