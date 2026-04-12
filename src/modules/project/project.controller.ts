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
import { ProjectService } from './project.service'
import {
  ProjectCreateDto,
  ProjectUpdateDto,
  ProjectRetrieveQueryDto,
} from './dtos'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AuthGuard, PermissionGuard } from '@guards'
import { PoliciesGuard, CheckPolicies } from '../../casl'
import { Permissions } from '@decorators'
import { PERMISSIONS } from '@constants'

@ApiBearerAuth()
@ApiTags('Project')
@UseGuards(AuthGuard, PermissionGuard, PoliciesGuard)
@Controller({
  path: 'project',
  version: '1',
})
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @Permissions(PERMISSIONS.PROJECT.LIST)
  @CheckPolicies((ability) => ability.can('read', 'Project'))
  async projectRetrieveAll(
    @Query() payload: ProjectRetrieveQueryDto,
    @Req() req: any,
  ) {
    return await this.projectService.projectRetrieveAll({
      ...payload,
      userId: req.user.userId,
      roleName: req.user.roleName,
      userDepartmentId: req.user.departmentId,
    })
  }

  @Get(':id')
  @Permissions(PERMISSIONS.PROJECT.READ)
  @CheckPolicies((ability) => ability.can('read', 'Project'))
  async projectRetrieveOne(@Param('id') id: string, @Req() req: any) {
    return await this.projectService.projectRetrieveOne({
      id,
      userId: req.user.userId,
      roleName: req.user.roleName,
      userDepartmentId: req.user.departmentId,
    })
  }

  @Post()
  @Permissions(PERMISSIONS.PROJECT.CREATE)
  @CheckPolicies((ability) => ability.can('create', 'Project'))
  async projectCreate(@Body() payload: ProjectCreateDto, @Req() req: any) {
    return await this.projectService.projectCreate({
      ...payload,
      createdBy: req.user.userId,
    })
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.PROJECT.UPDATE)
  @CheckPolicies((ability) => ability.can('update', 'Project'))
  async projectUpdate(
    @Param('id') id: string,
    @Body() payload: ProjectUpdateDto,
    @Req() req: any,
  ) {
    return await this.projectService.projectUpdate({
      id,
      ...payload,
      updatedBy: req.user.userId,
    })
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.PROJECT.DELETE)
  @CheckPolicies((ability) => ability.can('delete', 'Project'))
  async projectDelete(@Param('id') id: string, @Req() req: any) {
    return await this.projectService.projectDelete({
      id,
      deletedBy: req.user.userId,
    })
  }
}
