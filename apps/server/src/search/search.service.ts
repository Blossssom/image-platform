import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { ImagePublishedEvent } from '../images/events/image-published.event';
import { Images } from '../entities/Images';
import { DataSource } from 'typeorm';
import { GetImagesDto, ImageSort } from '../images/dto/get-images.dto';

export interface SearchHit {
  id: string;
  status: string;
  url_thumbnail: string;
  width: number;
  height: number;
  is_nsfw: boolean;
  created_at: string;
  title: string;
  prompt: {
    positive: string;
    negative: string;
  };
  model: {
    name: string;
    hash: string;
  };
  tags: string[];
  user: {
    nickname: string;
  };
  stats: {
    view_count: number;
    like_count: number;
  };
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface EsHit<T> {
  _id: string;
  _source: T;
}

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly indexName = 'images_v1';
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.createIndexIfNotExists();
  }

  @OnEvent('image.published')
  async handleImagePublishedEvent(event: ImagePublishedEvent) {
    this.logger.log(`Handling image.published event for ID: ${event.imageId}`);
    try {
      const image = await this.dataSource.getRepository(Images).findOne({
        where: { id: event.imageId },
        relations: ['imageMetadata', 'user'],
      });

      if (image) {
        await this.indexImage(image);
        this.logger.log(`Indexed image ${image.id} successfully.`);
      } else {
        this.logger.warn(`Image ${event.imageId} not found for indexing.`);
      }
    } catch (error) {
      this.logger.error(`Failed to index image ${event.imageId}:`, error);
    }
  }

  async createIndexIfNotExists() {
    const exists = await this.elasticsearchService.indices.exists({
      index: this.indexName,
    });

    if (!exists) {
      await this.elasticsearchService.indices.create({
        index: this.indexName,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        body: {
          settings: {
            number_of_shards: 1,
            analysis: {
              analyzer: {
                prompt_analyzer: { type: 'standard' },
                korean_analyzer: {
                  type: 'custom',
                  tokenizer: 'nori_tokenizer',
                },
              },
            },
          },
          mappings: {
            properties: {
              id: { type: 'keyword' },
              status: { type: 'keyword' },
              url_thumbnail: { type: 'keyword', index: false },
              width: { type: 'integer' },
              height: { type: 'integer' },
              is_nsfw: { type: 'boolean' },
              created_at: { type: 'date' },
              title: { type: 'text', analyzer: 'korean_analyzer' },
              prompt: {
                properties: {
                  positive: { type: 'text', analyzer: 'prompt_analyzer' },
                  negative: { type: 'text', analyzer: 'prompt_analyzer' },
                },
              },
              model: {
                properties: {
                  name: { type: 'text', fields: { raw: { type: 'keyword' } } },
                  hash: { type: 'keyword' },
                },
              },
              tags: { type: 'keyword' },
              user: {
                properties: { nickname: { type: 'text' } },
              },
              stats: {
                properties: {
                  view_count: { type: 'long' },
                  like_count: { type: 'long' },
                },
              },
            },
          },
        } as any, // Cast to any to bypass strict typing on specific tokenizer/analyzer names
      });
      this.logger.log(`Index ${this.indexName} created.`);
    }
  }

  async indexImage(image: Images) {
    // Transform Entity to ES Document
    const doc = {
      id: image.id,
      status: image.status,
      url_thumbnail: image.urlThumbnail,
      width: image.width,
      height: image.height,
      is_nsfw: image.isNsfw,
      created_at: image.createdAt,
      title: image.imageMetadata?.title || '',
      prompt: {
        positive: image.imageMetadata?.positivePrompt || '',
        negative: image.imageMetadata?.negativePrompt || '',
      },
      model: {
        name: '', // TODO: Map from resources or simple field
        hash: image.imageMetadata?.modelHash || '',
      },
      tags: image.imageMetadata?.tags || [],
      user: {
        nickname: image.user?.nickname || 'Guest',
      },
      stats: {
        view_count: 0,
        like_count: 0,
      },
    };

    return this.elasticsearchService.index({
      index: this.indexName,
      id: image.id,
      document: doc,
    });
  }

  async search(dto: GetImagesDto): Promise<SearchResult<SearchHit>> {
    const {
      page = 1,
      limit = 20,
      sort = 'latest',
      query,
      modelId,
      username,
    } = dto;
    const from = (page - 1) * limit;

    const must: any[] = [];
    const filter: any[] = [
      { term: { status: 'PUBLISHED' } }, // Only show published images
    ];

    if (query) {
      must.push({
        multi_match: {
          query,
          fields: ['title^2', 'description', 'prompt', 'tags'],
        },
      });
    }

    if (modelId) {
      filter.push({ term: { 'meta.model.id': modelId } });
    }

    if (username) {
      must.push({ match: { 'user.nickname': username } });
    }

    // Sort Logic
    const sortParams: any[] = [];
    if (sort === ImageSort.LATEST) {
      sortParams.push({ created_at: 'desc' });
    } else if (sort === ImageSort.POPULAR) {
      sortParams.push({ created_at: 'desc' }); // Fallback
    }

    // this.logger.log(`Search DTO: ${JSON.stringify(dto)}`);
    const queryBody = {
      from,
      size: limit,
      query: {
        bool: {
          must,
          filter,
        },
      },
      sort: sortParams,
    };
    // this.logger.log(`ES Query: ${JSON.stringify(queryBody)}`);

    try {
      const result = await this.elasticsearchService.search({
        index: this.indexName,
        ...queryBody,
      });

      const hits = result.hits.hits;
      const total =
        typeof result.hits.total === 'object'
          ? result.hits.total.value
          : result.hits.total;

      return {
        items: hits.map((hit: unknown) => {
          const esHit = hit as EsHit<Omit<SearchHit, 'id'>>;
          return {
            id: esHit._id,
            ...esHit._source,
          };
        }),
        total: total as number,
        page,
        limit,
        totalPages: Math.ceil((total as number) / limit),
      };
    } catch (error) {
      console.error('Elasticsearch Search Error:', error);
      throw error;
    }
  }

  async syncAll() {
    this.logger.log('Starting bulk sync of all PUBLISHED images...');

    // 1. Fetch all PUBLISHED images from DB
    // TODO: For very large datasets, use cursor/pagination. For now, 1000 limit is safe for dev.
    const images = await this.dataSource.getRepository(Images).find({
      where: { status: 'PUBLISHED' },
      relations: ['imageMetadata', 'user'],
      take: 1000,
    });

    if (images.length === 0) {
      this.logger.log('No PUBLISHED images found to sync.');
      return { count: 0, message: 'No images to sync' };
    }

    this.logger.log(`Found ${images.length} images. Indexing...`);

    // 2. Index each image
    // Using bulk API would be more efficient, but reusing indexImage is safer for consistency for now.
    // If performance becomes an issue, we can switch to bulk helper.
    let successCount = 0;
    let failCount = 0;

    for (const image of images) {
      try {
        await this.indexImage(image);
        successCount++;
      } catch (error) {
        this.logger.error(
          `Failed to index image ${image.id} during sync`,
          error,
        );
        failCount++;
      }
    }

    this.logger.log(
      `Sync complete. Success: ${successCount}, Failed: ${failCount}`,
    );
    return {
      total: images.length,
      success: successCount,
      failed: failCount,
      message: 'Bulk sync completed',
    };
  }
}
