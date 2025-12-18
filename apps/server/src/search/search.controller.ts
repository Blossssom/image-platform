import { Controller, Post } from '@nestjs/common';
import { SearchService } from './search.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post('sync')
  @ApiOperation({ summary: 'Sync all images from DB to Elasticsearch' })
  @ApiResponse({ status: 201, description: 'Sync completed' })
  async syncAll() {
    return this.searchService.syncAll();
  }
}
