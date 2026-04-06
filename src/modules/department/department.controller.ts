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
import { DepartmentService } from './department.service'
import {
  DepartmentCreateDto,
  DepartmentDeleteDto,
  DepartmentListResponseDto,
  DepartmentResponseDto,
  DepartmentUpdateDto,
} from './dtos'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { AuthGuard, PermissionGuard } from '@guards'
import { Permissions, User } from '@decorators'
import { PERMISSIONS } from '@constants'

@ApiBearerAuth()
@ApiTags('Department')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'department',
  version: '1',
})
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  @Permissions(PERMISSIONS.DEPARTMENT.LIST)
  @ApiOperation({ summary: 'Department Retrieve All' })
  @ApiResponse({ status: 200, type: DepartmentListResponseDto })
  async departmentRetrieveAll(@Query() payload: any) {
    return await this.departmentService.departmentRetrieveAll(payload)
  }

  @Get(':id')
  @Permissions(PERMISSIONS.DEPARTMENT.READ)
  @ApiOperation({ summary: 'Department Retrieve One' })
  @ApiResponse({ status: 200, type: DepartmentResponseDto })
  async departmentRetrieveOne(@Param('id') id: string) {
    return await this.departmentService.departmentRetrieveOne({ id })
  }

  @Post()
  @Permissions(PERMISSIONS.DEPARTMENT.CREATE)
  @ApiOperation({ summary: 'Department Create' })
  @ApiResponse({ status: 201, description: 'Department created successfully' })
  async departmentCreate(
    @Body() payload: DepartmentCreateDto,
    @User() user: { id: string },
  ) {
    return await this.departmentService.departmentCreate({
      ...payload,
      createdBy: user.id,
    })
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.DEPARTMENT.UPDATE)
  @ApiOperation({ summary: 'Department Update' })
  @ApiResponse({ status: 200, description: 'Department updated successfully' })
  async departmentUpdate(
    @Param('id') id: string,
    @Body() payload: DepartmentUpdateDto,
    @User() user: { id: string },
  ) {
    return await this.departmentService.departmentUpdate({
      id,
      ...payload,
      updatedBy: user.id,
    })
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.DEPARTMENT.DELETE)
  @ApiOperation({ summary: 'Department Delete' })
  @ApiResponse({ status: 200, description: 'Department deleted successfully' })
  async departmentDelete(
    @Param('id') id: string,
    @User() user: { id: string },
  ) {
    return await this.departmentService.departmentDelete({
      id,
      deletedBy: user.id,
    })
  }
}
