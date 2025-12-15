import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Images } from '../entities/Images';

import { ImageMetadata } from '../entities/ImageMetadata';

@Injectable()
export class ImagesRepository {
  constructor(
    @InjectRepository(Images)
    private readonly repository: Repository<Images>,
    @InjectRepository(ImageMetadata)
    private readonly metadataRepository: Repository<ImageMetadata>,
    private readonly dataSource: DataSource,
  ) {}

  create(data: Partial<Images>): Images {
    return this.repository.create(data);
  }

  async findOne(id: string): Promise<Images | null> {
    return this.repository.findOne({ where: { id }, relations: ['imageMetadata'] });
  }

  async save(image: Images, metadata?: Partial<ImageMetadata>): Promise<Images> {
    return this.dataSource.transaction(async (manager) => {
      const savedImage = await manager.save(Images, image);

      if (metadata) {
        const imageMetadata = manager.create(ImageMetadata, {
          ...metadata,
          imageId: savedImage.id,
        });
        await manager.save(ImageMetadata, imageMetadata);
        savedImage.imageMetadata = imageMetadata;
      }

      return savedImage;
    });
  }
}
