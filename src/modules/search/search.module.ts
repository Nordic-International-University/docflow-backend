import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { SearchService } from './search.service'
import { SearchIndexService } from './search-index.service'
import { SearchController } from './search.controller'

@Module({
  imports: [PrismaModule],
  providers: [SearchService, SearchIndexService],
  controllers: [SearchController],
  exports: [SearchService, SearchIndexService],
})
export class SearchModule {}
