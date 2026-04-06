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
import { ProjectMemberService } from './project-member.service'
import {
  ProjectMemberCreateDto,
  ProjectMemberUpdateDto,
  ProjectMemberRetrieveQueryDto,
  ProjectMemberListResponseDto,
  ProjectMemberResponseDto,
} from './dtos'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { AuthGuard, PermissionGuard } from '@guards'
import { Permissions } from '@decorators'
import { PERMISSIONS } from '@constants'

@ApiBearerAuth()
@ApiTags('Project Member')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'project-member',
  version: '1',
})
export class ProjectMemberController {
  constructor(private readonly projectMemberService: ProjectMemberService) {}

  @Get()
  @Permissions(PERMISSIONS.PROJECT.MANAGE_MEMBERS)
  @ApiOperation({ summary: 'Project Member Retrieve All' })
  @ApiQuery({ name: 'pageNumber', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: ['OWNER', 'MANAGER', 'MEMBER', 'VIEWER'],
  })
  @ApiResponse({ status: 200, type: ProjectMemberListResponseDto })
  async projectMemberRetrieveAll(
    @Query() payload: ProjectMemberRetrieveQueryDto,
  ) {
    return await this.projectMemberService.projectMemberRetrieveAll(payload)
  }

  @Get(':id')
  @Permissions(PERMISSIONS.PROJECT.MANAGE_MEMBERS)
  @ApiOperation({ summary: 'Project Member Retrieve One' })
  @ApiResponse({ status: 200, type: ProjectMemberResponseDto })
  async projectMemberRetrieveOne(@Param('id') id: string) {
    return await this.projectMemberService.projectMemberRetrieveOne({ id })
  }

  @Post()
  @Permissions(PERMISSIONS.PROJECT.MANAGE_MEMBERS)
  @ApiOperation({ summary: 'Project Member Create' })
  @ApiResponse({
    status: 201,
    description: 'Project member added successfully',
  })
  async projectMemberCreate(
    @Body() payload: ProjectMemberCreateDto,
    @Req() req: any,
  ) {
    return await this.projectMemberService.projectMemberCreate({
      ...payload,
      createdBy: req.user?.userId,
    })
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.PROJECT.MANAGE_MEMBERS)
  @ApiOperation({ summary: 'Project Member Update' })
  @ApiResponse({
    status: 200,
    description: 'Project member updated successfully',
  })
  async projectMemberUpdate(
    @Param('id') id: string,
    @Body() payload: ProjectMemberUpdateDto,
    @Req() req: any,
  ) {
    return await this.projectMemberService.projectMemberUpdate({
      id,
      ...payload,
      updatedBy: req.user?.userId,
    })
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.PROJECT.MANAGE_MEMBERS)
  @ApiOperation({ summary: 'Project Member Delete' })
  @ApiResponse({
    status: 200,
    description: 'Project member removed successfully',
  })
  async projectMemberDelete(@Param('id') id: string, @Req() req: any) {
    return await this.projectMemberService.projectMemberDelete({ id, deletedBy: req.user?.userId })
  }
}
