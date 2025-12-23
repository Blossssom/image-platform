import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ImagesRepository } from './images.repository';
import { StorageService } from '../common/file-storage/storage.service';
import { PublishImageDto } from './dto/publish-image.dto';
import { ImageDetailDto } from './dto/image-detail.dto';
import sharp from 'sharp';
import { IUploadImageResponse } from '@shared/types';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ImagePublishedEvent } from './events/image-published.event';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

import { MetadataService } from './metadata.service';

import { GetImagesDto } from './dto/get-images.dto';
import {
  SearchService,
  SearchHit,
  SearchResult,
} from '../search/search.service';

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  constructor(
    private readonly imagesRepository: ImagesRepository,
    private readonly storageService: StorageService,
    private readonly metadataService: MetadataService,
    private readonly eventEmitter: EventEmitter2,
    @InjectRedis() private readonly redis: Redis,
    private readonly searchService: SearchService,
  ) {}

  async uploadImage(file: Express.Multer.File): Promise<IUploadImageResponse> {
    // 1. Upload File (Local/S3)
    const url = await this.storageService.uploadFile(file, 'originals');

    // 2. Get Image Dimensions & Metadata
    const imageMetadata = await sharp(file.buffer).metadata();
    const extractedMetadata =
      await this.metadataService.extractMetadata(imageMetadata);

    // 2.1 Generate Thumbnail
    // Resize to width 450px, auto height, webp format
    const thumbnailBuffer = await sharp(file.buffer)
      .resize({ width: 450, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const thumbnailFilename = `thumb-${Date.now()}.webp`;
    const urlThumbnail = await this.storageService.uploadBuffer(
      thumbnailBuffer,
      thumbnailFilename,
      'thumbnails',
    );

    // 3. Save to DB (Draft)
    const image = this.imagesRepository.create({
      urlOriginal: url,
      urlThumbnail: urlThumbnail,
      width: imageMetadata.width || 0,
      height: imageMetadata.height || 0,
      status: 'DRAFT',
      // user: dto.nickname ? ... : null // TODO: Handle user logic
    });

    // Assign extracted metadata to image entity (assuming relation is set up or handled in repository)
    // For now, we pass it to repository to handle saving
    await this.imagesRepository.save(image, extractedMetadata);

    return {
      id: image.id,
      url: image.urlOriginal,
    };
  }

  async publishImage(id: string, dto: PublishImageDto) {
    // 1. Check if image exists and is in DRAFT status
    const image = await this.imagesRepository.findOne(id);
    if (!image) {
      throw new NotFoundException('Image not found');
    }

    if (image.status !== 'DRAFT') {
      throw new BadRequestException(
        'Image is already published or not in DRAFT status',
      );
    }

    // 2. Update Image Status & Metadata
    image.status = 'PUBLISHED';
    // Update basic info in Images table if needed (e.g. updatedAt) - automatic via TypeORM

    // Merge DTO into existing metadata
    // We need to fetch existing metadata or upsert it.
    // Ideally repository handles this.
    const metadataUpdates = {
      title: dto.title,
      description: dto.description,
      isNsfw: dto.isNsfw,
      tags: dto.tags,
      generationTool: dto.generationTool,
      generationMethod: dto.generationMethod,
      positivePrompt: dto.positivePrompt,
      negativePrompt: dto.negativePrompt,
      modelHash: dto.modelHash,
      sampler: dto.sampler,
      steps: dto.steps,
      cfgScale: dto.cfgScale,
      seed: dto.seed,
      resources: dto.resources,
    };

    // 3. Save updates
    await this.imagesRepository.saveMetadata(image.id, metadataUpdates);

    // Update image status to PUBLISHED
    image.status = 'PUBLISHED';
    // Manually merge for Elasticsearch indexing purposes (does not affect DB save above)
    if (image.imageMetadata) {
      Object.assign(image.imageMetadata, metadataUpdates);
    }

    await this.imagesRepository.save(image);

    // Index to Elasticsearch (Decoupled via Event)
    this.eventEmitter.emit(
      'image.published',
      new ImagePublishedEvent(image.id),
    );

    // Invalidate Cache
    await this.redis.del(`image:detail:${id}`);
    this.logger.log(`[Cache INVALIDATE] Image ${id} cache cleared`);

    return image;
  }

  async getImageDetail(id: string): Promise<ImageDetailDto> {
    const cacheKey = `image:detail:${id}`;
    const cachedData = await this.redis.get(cacheKey);

    if (cachedData) {
      this.logger.log(`[Cache HIT] Image ${id} served from Redis`);
      return JSON.parse(cachedData) as ImageDetailDto;
    }

    this.logger.log(`[Cache MISS] Image ${id} fetched from DB`);
    const image = await this.imagesRepository.findOne(id);

    if (!image || image.status !== 'PUBLISHED') {
      throw new NotFoundException('Image not found');
    }

    // Map Entity to DTO (Manual mapping for control, or use mapper)
    const result = {
      id: image.id,
      urlOriginal: image.urlOriginal,
      urlThumbnail: image.urlThumbnail,
      width: image.width,
      height: image.height,
      isNsfw: image.imageMetadata?.isNsfw || false,
      createdAt: image.createdAt,
      title: image.imageMetadata?.title,
      description: image.imageMetadata?.description,
      generationTool: image.imageMetadata?.generationTool,
      generationMethod: image.imageMetadata?.generationMethod,
      positivePrompt: image.imageMetadata?.positivePrompt,
      negativePrompt: image.imageMetadata?.negativePrompt,
      modelHash: image.imageMetadata?.modelHash,
      tags: image.imageMetadata?.tags,
      sampler: image.imageMetadata?.sampler,
      steps: image.imageMetadata?.steps,
      cfgScale: image.imageMetadata?.cfgScale,
      seed: image.imageMetadata?.seed,
      resources: image.imageMetadata?.resources,
      userNickname: image.user?.nickname || 'Guest', // Fallback
    };

    // Cache for 1 hour (3600 seconds)
    await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 3600);

    return result as ImageDetailDto;
  }

  async getImages(dto: GetImagesDto): Promise<SearchResult<SearchHit>> {
    return this.searchService.search(dto);
  }
}
