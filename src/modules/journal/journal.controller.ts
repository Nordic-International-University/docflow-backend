import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Body,
  Query,
  ParseUUIDPipe,
  Req,
  UseGuards,
} from '@nestjs/common'
import { JournalService } from './journal.service'
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger'
import {
  JournalCreateDto,
  JournalUpdateDto,
  JournalDeleteDto,
  JournalResponseDto,
  JournalListResponseDto,
} from './dtos'
import { AuthGuard, PermissionGuard } from '@guards'
import { Permissions } from '@decorators'
import { PERMISSIONS } from '@constants'

@ApiBearerAuth()
@ApiTags('Journal')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'journal',
  version: '1',
})
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Get()
  @Permissions(PERMISSIONS.JOURNAL.LIST)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all journals with pagination and search' })
  @ApiResponse({
    status: 200,
    description: 'Journals retrieved successfully',
    type: JournalListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({
    name: 'pageNumber',
    required: false,
    type: Number,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term for filtering journals',
  })
  async journalRetrieveAll(
    @Query('pageNumber') pageNumber?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
  ): Promise<JournalListResponseDto> {
    return this.journalService.journalRetrieveAll({
      pageNumber,
      pageSize,
      search,
    })
  }

  @Get(':id')
  @Permissions(PERMISSIONS.JOURNAL.READ)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a single journal by ID' })
  @ApiResponse({
    status: 200,
    description: 'Journal retrieved successfully',
    type: JournalResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Journal not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({
    name: 'id',
    description: 'Journal ID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  async journalRetrieveOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<JournalResponseDto> {
    return await this.journalService.journalRetrieveOne({
      id,
    })
  }

  @Post()
  @Permissions(PERMISSIONS.JOURNAL.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new journal' })
  @ApiResponse({
    status: 201,
    description: 'Journal created successfully',
    type: JournalResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: JournalCreateDto })
  async journalCreate(@Body() createDto: JournalCreateDto, @Req() req: any) {
    return this.journalService.journalCreate({ ...createDto, createdBy: req.user?.userId })
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.JOURNAL.UPDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing journal' })
  @ApiResponse({
    status: 200,
    description: 'Journal updated successfully',
    type: JournalResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Journal not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({
    name: 'id',
    description: 'Journal ID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @ApiBody({ type: JournalUpdateDto })
  async journalUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: JournalUpdateDto,
    @Req() req: any,
  ) {
    return this.journalService.journalUpdate({
      id,
      ...updateDto,
      updatedBy: req.user?.userId,
    })
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.JOURNAL.DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a journal' })
  @ApiResponse({
    status: 200,
    description: 'Journal deleted successfully',
    type: JournalResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Journal not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({
    name: 'id',
    description: 'Journal ID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  async journalDelete(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.journalService.journalDelete({ id, deletedBy: req.user?.userId })
  }
}
