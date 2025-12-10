import { Injectable } from '@nestjs/common';
import { ImagesRepository } from './images.repository';
import { StorageService } from '../common/file-storage/storage.service';
import { UploadImageDto } from './dto/upload-image.dto';
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
    const extractedMetadata = await this.metadataService.extractMetadata(file.buffer);

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
}
