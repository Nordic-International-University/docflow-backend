import {
  PermissionDeleteRequest,
  PermissionRetrieveOneRequest,
  PermissionUpdateRequest,
} from './interfaces'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { PermissionService } from './permission.service'
import { PermissionCreteateDto, PermissionRetrieveAllDto } from './dtos'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { AuthGuard, PermissionGuard } from '@guards'
import { Permissions } from '@decorators'
import { PERMISSIONS } from '@constants'

@ApiBearerAuth()
@ApiTags('Permission')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'permission',
  version: '1',
})
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @Permissions(PERMISSIONS.PERMISSION.LIST)
  @ApiOperation({ summary: 'Permission Retrieve All' })
  @ApiQuery({ name: 'pageNumber', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  async permissionRetrieveAll(@Query() payload: PermissionRetrieveAllDto) {
    return await this.permissionService.permissionRetrieveAll(payload)
  }

  @Get(':id')
  @Permissions(PERMISSIONS.PERMISSION.READ)
  @ApiOperation({ summary: 'Permission Retrieve One' })
  async permissionRetrieveOne(@Param() payload: PermissionRetrieveOneRequest) {
    return await this.permissionService.permissionRetrieveOne(payload)
  }

  @Post()
  @Permissions(PERMISSIONS.PERMISSION.CREATE)
  @ApiOperation({ summary: 'Permission Create' })
  async permissionCreate(@Body() payload: PermissionCreteateDto) {
    return await this.permissionService.permissionCreate(payload)
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.PERMISSION.UPDATE)
  @ApiOperation({ summary: 'Permission Update' })
  async permissionUpdate(
    @Param() payload: PermissionUpdateRequest,
    @Body() body: any,
  ) {
    return await this.permissionService.permissionUpdate({
      id: payload.id,
      ...body,
    })
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.PERMISSION.DELETE)
  @ApiOperation({ summary: 'Permission Delete' })
  async permissionDelete(@Param() payload: PermissionDeleteRequest) {
    return await this.permissionService.permissionDelete(payload)
  }
}
