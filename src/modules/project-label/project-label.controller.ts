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
import { ProjectLabelService } from './project-label.service'
import {
  ProjectLabelCreateDto,
  ProjectLabelUpdateDto,
  ProjectLabelRetrieveQueryDto,
  ProjectLabelListResponseDto,
  ProjectLabelResponseDto,
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
@ApiTags('Project Label')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'project-label',
  version: '1',
})
export class ProjectLabelController {
  constructor(private readonly projectLabelService: ProjectLabelService) {}

  @Get()
  @Permissions(PERMISSIONS.PROJECT.MANAGE_LABELS)
  @ApiOperation({ summary: 'Project Label Retrieve All' })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: 'pageNumber', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, type: ProjectLabelListResponseDto })
  async projectLabelRetrieveAll(
    @Query() payload: ProjectLabelRetrieveQueryDto,
  ) {
    return await this.projectLabelService.projectLabelRetrieveAll(payload)
  }

  @Get(':id')
  @Permissions(PERMISSIONS.PROJECT.MANAGE_LABELS)
  @ApiOperation({ summary: 'Project Label Retrieve One' })
  @ApiResponse({ status: 200, type: ProjectLabelResponseDto })
  async projectLabelRetrieveOne(@Param('id') id: string) {
    return await this.projectLabelService.projectLabelRetrieveOne({ id })
  }

  @Post()
  @Permissions(PERMISSIONS.PROJECT.MANAGE_LABELS)
  @ApiOperation({ summary: 'Project Label Create' })
  @ApiResponse({
    status: 201,
    description: 'Project label created successfully',
  })
  async projectLabelCreate(
    @Body() payload: ProjectLabelCreateDto,
    @Req() req: any,
  ) {
    return await this.projectLabelService.projectLabelCreate({
      ...payload,
      createdBy: req.user?.userId,
    })
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.PROJECT.MANAGE_LABELS)
  @ApiOperation({ summary: 'Project Label Update' })
  @ApiResponse({
    status: 200,
    description: 'Project label updated successfully',
  })
  async projectLabelUpdate(
    @Param('id') id: string,
    @Body() payload: ProjectLabelUpdateDto,
    @Req() req: any,
  ) {
    return await this.projectLabelService.projectLabelUpdate({
      id,
      ...payload,
      updatedBy: req.user?.userId,
    })
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.PROJECT.MANAGE_LABELS)
  @ApiOperation({ summary: 'Project Label Delete' })
  @ApiResponse({
    status: 200,
    description: 'Project label deleted successfully',
  })
  async projectLabelDelete(@Param('id') id: string, @Req() req: any) {
    return await this.projectLabelService.projectLabelDelete({
      id,
      deletedBy: req.user?.userId,
    })
  }
}
