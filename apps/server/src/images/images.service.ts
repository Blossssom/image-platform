import { Injectable } from '@nestjs/common';
import { ImagesRepository } from './images.repository';
import { StorageService } from '../common/file-storage/storage.service';
import { UploadImageDto } from './dto/upload-image.dto';
import sharp from 'sharp';
import { IUploadImageResponse } from '@shared/types';

@Injectable()
export class ImagesService {
  constructor(
    private readonly imagesRepository: ImagesRepository,
    private readonly storageService: StorageService,
  ) {}

  async uploadImage(file: Express.Multer.File, dto: UploadImageDto): Promise<IUploadImageResponse> {
    // 1. Upload File (Local/S3)
    console.log(file)
    const url = await this.storageService.uploadFile(file);

    // 2. Get Image Dimensions (Metadata)
    const metadata = await sharp(file.buffer).metadata();

    // 3. Save to DB (Draft)
    const image = this.imagesRepository.create({
      urlOriginal: url,
      urlThumbnail: url, // TODO: Implement thumbnail generation
      width: metadata.width || 0,
      height: metadata.height || 0,
      status: 'DRAFT',
      // user: dto.nickname ? ... : null // TODO: Handle user logic
    });

    await this.imagesRepository.save(image);

    return {
      id: image.id,
      url: image.urlOriginal,
    };
  }
}
