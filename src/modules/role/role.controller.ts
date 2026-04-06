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
  Res,
  UseGuards,
} from '@nestjs/common'
import { RoleService } from './role.service'
import { RoleDeleteRequest } from './interfaces'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthGuard, PermissionGuard } from '@guards'
import { Permissions } from '@decorators'
import { PERMISSIONS } from '@constants'

@ApiBearerAuth()
@ApiTags('Role')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'role',
  version: '1',
})
export class RoleController {
  constructor(private readonly roleService: RoleService) {}
  @Get()
  @Permissions(PERMISSIONS.ROLE.LIST)
  @ApiOperation({ summary: 'Role Retrieve All' })
  async roleRetrieveAll(@Query() payload: any) {
    console.log('RoleController roleRetrieveAll payload', payload)
    return await this.roleService.roleRetrieveAll(payload)
  }

  @Get(':id')
  @Permissions(PERMISSIONS.ROLE.READ)
  @ApiOperation({ summary: 'Role Retrieve One' })
  async roleRetrieveOne(@Param() payload: any) {
    return await this.roleService.roleRetrieveOne(payload)
  }

  @Post()
  @Permissions(PERMISSIONS.ROLE.CREATE)
  @ApiOperation({ summary: 'Role Create' })
  async roleCreate(@Body() payload: any) {
    return await this.roleService.roleCreate(payload)
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.ROLE.UPDATE)
  @ApiOperation({ summary: 'Role Update' })
  async roleUpdate(@Param() param: { id: string }, @Body() payload: any) {
    return await this.roleService.roleUpdate({
      id: param.id,
      ...payload,
    })
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.ROLE.DELETE)
  @ApiOperation({ summary: 'Role Delete' })
  async roleDelete(@Param() payload: RoleDeleteRequest) {
    return await this.roleService.roleDelete(payload)
  }
}
