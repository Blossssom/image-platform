import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as exifr from 'exifr';
import pngText from 'png-chunk-text';
import extract from 'png-chunks-extract';
import sharp from 'sharp';
import { Images } from '../entities/Images';
import { StorageService } from '../common/services/storage.service';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Images)
    private readonly imagesRepository: Repository<Images>,
    @Inject('StorageService')
    private readonly storageService: StorageService,
  ) {}

  async findOne(id: string): Promise<Images> {
    const image = await this.imagesRepository.findOne({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    return image;
  }


  async processAndSaveImage(
    file: Express.Multer.File,
    postId: string,
    generationInfo: object,
  ): Promise<Images> {
    // Metadata is now passed in from the frontend after being parsed and edited.
    const imageDimensions = await sharp(file.buffer).metadata();

    // 2. Create and upload thumbnail image (450px WebP)
    const thumbBuffer = await sharp(file.buffer)
      .resize({ width: 450 })
      .webp({ quality: 80 })
      .toBuffer();
    const { url: thumbUrl } = await this.storageService.save(
      thumbBuffer,
      `thumb-${file.originalname.split('.')[0]}.webp`,
      'image/webp',
    );

    // 3. Create and upload preview image (1600px WebP)
    const previewBuffer = await sharp(file.buffer)
      .resize({ width: 1600, withoutEnlargement: true }) // Do not enlarge smaller images
      .webp({ quality: 85 })
      .toBuffer();
    const { url: previewUrl } = await this.storageService.save(
      previewBuffer,
      `preview-${file.originalname.split('.')[0]}.webp`,
      'image/webp',
    );

    // 4. Upload original image
    const { url: originalUrl } = await this.storageService.save(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    // 5. Create and save image entity to DB
    const newImage = this.imagesRepository.create({
      post: { id: postId },
      urlOriginal: originalUrl,
      urlPreview: previewUrl,
      urlThumbnail: thumbUrl,
      width: imageDimensions.width,
      height: imageDimensions.height,
      aspectRatio:
        (imageDimensions.width || 1) / (imageDimensions.height || 1),
      generationInfo: generationInfo,
    });

    return this.imagesRepository.save(newImage);
  }

  async getDownloadUrl(id: string): Promise<string> {
    const image = await this.findOne(id);

    // Extract key from the full URL for S3, or use path directly for local
    let key: string;
    try {
      const url = new URL(image.urlOriginal);
      key = url.pathname.substring(1); // Remove leading '/' from '/path/to/key'
    } catch (error) {
      // If new URL() fails, it's likely a local path already
      key = image.urlOriginal;
    }

    return this.storageService.getPresignedUrl(key);
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
