import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ImagesRepository } from './images.repository';
import { StorageService } from '../common/file-storage/storage.service';
import { UploadImageDto } from './dto/upload-image.dto';
import { PublishImageDto } from './dto/publish-image.dto';
import sharp from 'sharp';
import { IUploadImageResponse } from '@shared/types';

import { MetadataService } from './metadata.service';

@Injectable()
export class ImagesService {
  constructor(
    private readonly imagesRepository: ImagesRepository,
    private readonly storageService: StorageService,
    private readonly metadataService: MetadataService,
  ) {}

  async uploadImage(file: Express.Multer.File, dto: UploadImageDto): Promise<IUploadImageResponse> {
    // 1. Upload File (Local/S3)
    const url = await this.storageService.uploadFile(file);

    // 2. Get Image Dimensions & Metadata
    const sharpMetadata = await sharp(file.buffer).metadata();
    const extractedMetadata = await this.metadataService.extractMetadata(sharpMetadata);

    // 3. Save to DB (Draft)
    const image = this.imagesRepository.create({
      urlOriginal: url,
      urlThumbnail: url, // TODO: Implement thumbnail generation
      width: sharpMetadata.width || 0,
      height: sharpMetadata.height || 0,
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
      throw new BadRequestException('Image is already published or not in DRAFT status');
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
    await this.imagesRepository.save(image, metadataUpdates);

    return {
      id: image.id,
      status: image.status,
    };
  }
}
