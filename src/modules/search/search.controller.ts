import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger'
import { AuthGuard, PermissionGuard } from '@guards'
import { PoliciesGuard } from '../../casl'
import { SearchService, SearchResponse } from './search.service'
import { SearchIndexService } from './search-index.service'

@ApiTags('Search')
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard, PoliciesGuard)
@Controller({ path: 'search', version: '1' })
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly searchIndexService: SearchIndexService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Global search across all entities',
    description:
      "Hujjatlar, topshiriqlar, loyihalar, workflow'lar, foydalanuvchilar va jurnallar bo'yicha qidirish. ABAC bo'yicha faqat ruxsat etilgan natijalar qaytariladi.",
  })
  @ApiQuery({ name: 'q', required: true, description: 'Qidiruv so\'zi (kamida 2 belgi)' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['all', 'document', 'task', 'project', 'workflow', 'user', 'journal'],
    description: "Entity turi (default: all)",
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Search results with facets' })
  async search(
    @Query('q') q: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Req() req?: any,
  ): Promise<SearchResponse> {
    return this.searchService.globalSearch(q, {
      type,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      ability: req?.ability,
      userId: req?.user?.userId,
    })
  }

  @Post('index/document/:id')
  @ApiOperation({ summary: 'Index a document (extract PDF/DOCX text)' })
  async indexDocument(@Param('id') id: string) {
    await this.searchIndexService.indexDocumentAttachments(id)
    return { message: 'Document indexed' }
  }

  @Post('index/all')
  @ApiOperation({ summary: 'Bulk index all documents (admin)' })
  async bulkIndex() {
    return this.searchIndexService.bulkIndexAllDocuments()
  }
}
