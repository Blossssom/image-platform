import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as exifr from 'exifr';
import pngText from 'png-chunk-text';
import extract from 'png-chunks-extract';
import sharp from 'sharp';
import { Images } from '../entities/Images';
import { S3Service } from '../common/services/s3.service';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Images)
    private readonly imagesRepository: Repository<Images>,
    private readonly s3Service: S3Service
  ) {}

  async processAndSaveImage(file: Express.Multer.File): Promise<Images> {
    // 1. Parse metadata
    const metadata = await this.parseMetadata(file.buffer);
    const imageDimensions = await sharp(file.buffer).metadata();

    // 2. Create and upload thumbnail image (450px WebP)
    const thumbBuffer = await sharp(file.buffer)
      .resize({ width: 450 })
      .webp({ quality: 80 })
      .toBuffer();
    const thumbUrl = await this.s3Service.uploadFile(
      thumbBuffer,
      `thumb-${file.originalname.split('.')[0]}.webp`,
      'image/webp'
    );

    // 3. Create and upload preview image (1600px WebP)
    const previewBuffer = await sharp(file.buffer)
      .resize({ width: 1600, withoutEnlargement: true }) // Do not enlarge smaller images
      .webp({ quality: 85 })
      .toBuffer();
    const previewUrl = await this.s3Service.uploadFile(
      previewBuffer,
      `preview-${file.originalname.split('.')[0]}.webp`,
      'image/webp'
    );

    // 4. Upload original image to S3
    const originalUrl = await this.s3Service.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype
    );

    // 5. Create and save image entity to DB
    const newImage = this.imagesRepository.create({
      urlOriginal: originalUrl,
      urlPreview: previewUrl,
      urlThumbnail: thumbUrl,
      width: imageDimensions.width,
      height: imageDimensions.height,
      aspectRatio: (imageDimensions.width || 1) / (imageDimensions.height || 1),
      generationInfo: metadata,
      // Note: `post` or `userId` will be linked by the calling service (e.g., PostsService)
    });

    return this.imagesRepository.save(newImage);
  }

  private async parseMetadata(buffer: Buffer): Promise<any> {
    try {
      const exifData = await exifr.parse(buffer, {
        tiff: true,
        exif: true,
        gps: true,
        interop: true,
      });

      if (exifData && exifData.parameters) {
        return { source: 'exif', data: exifData.parameters };
      }

      try {
        const chunks = extract(buffer);
        const textChunks = chunks
          .filter(chunk => chunk.name === 'tExt')
          .map(chunk => {
            return pngText.decode(chunk.data) || null;
          })
          .filter(item => item !== null);

        const parametersChunk = textChunks.find(
          chunk => chunk.keyword === 'parameters'
        );

        if (parametersChunk) {
          return { source: 'png-chunk', data: parametersChunk.text };
        }
      } catch (err) {
        console.warn('PNG chunk extraction failed :', err);
      }
    } catch (error) {
      console.error('Could not parse metadata :', error);
      return { source: 'error', data: {} };
    }
  }
}
