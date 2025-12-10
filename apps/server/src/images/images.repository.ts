import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Images } from '../entities/Images';

import { ImageMetadata } from '../entities/ImageMetadata';

@Injectable()
export class ImagesRepository {
  constructor(
    @InjectRepository(Images)
    private readonly repository: Repository<Images>,
    @InjectRepository(ImageMetadata)
    private readonly metadataRepository: Repository<ImageMetadata>,
  ) {}

  create(data: Partial<Images>): Images {
    return this.repository.create(data);
  }

  async save(image: Images, metadata?: Partial<ImageMetadata>): Promise<Images> {
    const savedImage = await this.repository.save(image);

    if (metadata) {
      const imageMetadata = this.metadataRepository.create({
        ...metadata,
        imageId: savedImage.id,
      });
      await this.metadataRepository.save(imageMetadata);
      savedImage.imageMetadata = imageMetadata;
    }

    return savedImage;
  }
}
