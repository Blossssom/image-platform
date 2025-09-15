import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';
import { join } from 'path';
import { promises as fs } from 'fs';
import { storagePaths, imageSizeConfig, AllowedImageFormat } from '../../config/upload.config';

export interface ProcessedImageUrls {
  thumbnail: string;
  medium: string;
  large: string;
  original: string;
}

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  aspectRatio: number;
  hasAlpha: boolean;
  colorSpace: string;
}

@Injectable()
export class ImageProcessingService {
  private readonly logger = new Logger(ImageProcessingService.name);

  /**
   * Process uploaded image into multiple resolutions
   */
  async processImage(
    tempFilePath: string,
    filename: string,
    userId: string
  ): Promise<{ urls: ProcessedImageUrls; metadata: ImageMetadata }> {
    try {
      this.logger.log(`Processing image: ${filename} for user: ${userId}`);

      // Create user-specific directories
      const userPaths = this.createUserDirectories(userId);

      // Get image metadata
      const metadata = await this.extractImageMetadata(tempFilePath);

      // Generate unique filename without extension
      const baseFilename = this.generateUniqueFilename(filename);

      // Process and save in different resolutions
      const urls = await this.generateImageVariants(
        tempFilePath,
        baseFilename,
        userPaths,
        metadata.format as AllowedImageFormat,
        userId
      );

      // Clean up temporary file
      await this.cleanupTempFile(tempFilePath);

      this.logger.log(`Successfully processed image: ${baseFilename}`);

      return { urls, metadata };
    } catch (error) {
      this.logger.error(`Error processing image: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  /**
   * Extract comprehensive image metadata
   */
  private async extractImageMetadata(filePath: string): Promise<ImageMetadata> {
    const image = sharp(filePath);
    const metadata = await image.metadata();
    const stats = await fs.stat(filePath);

    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown',
      size: stats.size,
      aspectRatio: metadata.width && metadata.height 
        ? Math.round((metadata.width / metadata.height) * 100) / 100 
        : 1,
      hasAlpha: metadata.hasAlpha || false,
      colorSpace: metadata.space || 'unknown',
    };
  }

  /**
   * Generate image variants in different sizes
   */
  private async generateImageVariants(
    sourcePath: string,
    baseFilename: string,
    userPaths: Record<string, string>,
    format: AllowedImageFormat,
    userId: string
  ): Promise<ProcessedImageUrls> {
    const image = sharp(sourcePath);
    const outputFormat = format === 'jpg' ? 'jpeg' : format;
    
    // Generate thumbnail
    const thumbnailPath = join(userPaths.thumbnails, `${baseFilename}.webp`);
    await image
      .clone()
      .resize(imageSizeConfig.thumbnail.width, imageSizeConfig.thumbnail.height, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: imageSizeConfig.thumbnail.quality })
      .toFile(thumbnailPath);

    // Generate medium size
    const mediumPath = join(userPaths.medium, `${baseFilename}.webp`);
    await image
      .clone()
      .resize(imageSizeConfig.medium.width, imageSizeConfig.medium.height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: imageSizeConfig.medium.quality })
      .toFile(mediumPath);

    // Generate large size
    const largePath = join(userPaths.large, `${baseFilename}.webp`);
    await image
      .clone()
      .resize(imageSizeConfig.large.width, imageSizeConfig.large.height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: imageSizeConfig.large.quality })
      .toFile(largePath);

    // Copy original with optimization
    const originalPath = join(userPaths.original, `${baseFilename}.${outputFormat}`);
    await image
      .clone()
      [outputFormat]({ quality: 95 })
      .toFile(originalPath);

    // Return relative URLs for database storage
    const baseUrl = `/uploads/${userId}`;
    return {
      thumbnail: `${baseUrl}/thumbnails/${baseFilename}.webp`,
      medium: `${baseUrl}/medium/${baseFilename}.webp`,
      large: `${baseUrl}/large/${baseFilename}.webp`,
      original: `${baseUrl}/original/${baseFilename}.${outputFormat}`,
    };
  }

  /**
   * Create user-specific directories
   */
  private createUserDirectories(userId: string): Record<string, string> {
    const userPaths = {
      thumbnails: join(storagePaths.thumbnails, userId),
      medium: join(storagePaths.medium, userId),
      large: join(storagePaths.large, userId),
      original: join(storagePaths.original, userId),
    };

    // Create directories if they don't exist
    Object.values(userPaths).forEach(path => {
      fs.mkdir(path, { recursive: true }).catch(err => {
        this.logger.error(`Error creating directory ${path}: ${err.message}`);
      });
    });

    return userPaths;
  }

  /**
   * Generate unique filename
   */
  private generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const randomNum = Math.round(Math.random() * 1000);
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '-');
    
    return `${sanitizedName}-${timestamp}-${randomNum}`;
  }

  /**
   * Clean up temporary file
   */
  private async cleanupTempFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      this.logger.log(`Cleaned up temporary file: ${filePath}`);
    } catch (error) {
      this.logger.warn(`Could not delete temporary file: ${filePath}`);
    }
  }

  /**
   * Delete all variants of an image
   */
  async deleteImageVariants(userId: string, filename: string): Promise<void> {
    const userPaths = this.createUserDirectories(userId);
    const baseFilename = filename.replace(/\.[^/.]+$/, '');

    const filesToDelete = [
      join(userPaths.thumbnails, `${baseFilename}.webp`),
      join(userPaths.medium, `${baseFilename}.webp`),
      join(userPaths.large, `${baseFilename}.webp`),
      join(userPaths.original, filename),
    ];

    await Promise.all(
      filesToDelete.map(async (filePath) => {
        try {
          await fs.unlink(filePath);
          this.logger.log(`Deleted file: ${filePath}`);
        } catch (error) {
          this.logger.warn(`Could not delete file: ${filePath}`);
        }
      })
    );
  }
}