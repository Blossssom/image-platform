
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { ImagePublishedEvent } from '../images/events/image-published.event';
import { DataSource } from 'typeorm'; // To fetch image details if payload only has ID
import { Images } from '../entities/Images';

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
        // Soft fail: Don't re-throw to avoid crashing the event loop, but log it.
    }
  }

  async createIndexIfNotExists() {
    // ... existing implementation remains same ...
    const exists = await this.elasticsearchService.indices.exists({
      index: this.indexName,
    });

    if (!exists) {
      await this.elasticsearchService.indices.create({
        index: this.indexName,
        body: {
          settings: {
            number_of_shards: 1,
            analysis: {
              analyzer: {
                prompt_analyzer: { type: 'standard' },
                korean_analyzer: { type: 'custom', tokenizer: 'nori_tokenizer' },
              },
            },
          },
          mappings: {
            properties: {
              id: { type: 'keyword' },
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
        },
      } as any);
      this.logger.log(`Index ${this.indexName} created.`);
    }
  }

  async indexImage(image: any) {
    // Transform Entity to ES Document
    const doc = {
        id: image.id,
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
        }
    };

    return this.elasticsearchService.index({
      index: this.indexName,
      id: image.id,
      document: doc,
    });
  }
}
