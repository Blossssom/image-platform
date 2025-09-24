import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Images } from '../entities/Images';
import { Users } from '../entities/Users';
import { ImageProcessingService } from './services/image-processing.service';
import { UploadImageDto } from './dto/upload-image.dto';
import { ImageResponseDto } from './dto/image-response.dto';
import { WorkflowsService } from '../workflows/workflows.service';

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  constructor(
    @InjectRepository(Images)
    private readonly imagesRepository: Repository<Images>,
    private readonly imageProcessingService: ImageProcessingService,
    private readonly workflowsService: WorkflowsService,
  ) {}

  /**
   * Upload and process a new image
   */
  async uploadImage(
    file: Express.Multer.File,
    uploadData: UploadImageDto,
    user: Users,
  ): Promise<ImageResponseDto> {
    this.logger.log(`Uploading image: ${file.originalname} for user: ${user.username}`);

    try {
      // Process the image and get URLs/metadata
      const { urls, metadata } = await this.imageProcessingService.processImage(
        file.path,
        file.originalname,
        user.id,
      );

      // Create image entity
      const image = this.imagesRepository.create({
        title: uploadData.title || this.generateTitle(file.originalname),
        description: uploadData.description,
        filename: file.originalname,
        originalFilename: file.originalname,
        imagePath: urls.original,
        fileSize: metadata.size,
        mimeType: file.mimetype,
        width: metadata.width,
        height: metadata.height,
        aspectRatio: metadata.aspectRatio.toString(),
        exifData: metadata,
        generationParams: uploadData.generationParams ? {
          raw: uploadData.generationParams,
        } : null,
        isPublic: uploadData.isPublic ?? true,
        hasWorkflow: false, // Will be updated if workflow is detected
        user,
        likeCount: 0,
        viewCount: 0,
      });

      const savedImage = await this.imagesRepository.save(image);

      // Process workflow data if present in metadata or explicit workflow data
      try {
        let workflowCreated = false;

        // Check if explicit workflow data was provided
        if (uploadData.workflowData) {
          await this.workflowsService.createWorkflow({
            imageId: savedImage.id,
            workflowData: uploadData.workflowData,
            title: uploadData.workflowTitle || `Workflow for ${savedImage.title}`,
            description: uploadData.workflowDescription,
            category: uploadData.workflowCategory,
            isPublic: uploadData.isPublic ?? true,
          });
          workflowCreated = true;
        } else {
          // Try to extract workflow from image metadata
          const workflow = await this.workflowsService.processWorkflowFromImage(
            savedImage.id, 
            metadata
          );
          if (workflow) {
            workflowCreated = true;
          }
        }

        // Update image hasWorkflow flag if workflow was created
        if (workflowCreated) {
          await this.imagesRepository.update(savedImage.id, { hasWorkflow: true });
          savedImage.hasWorkflow = true;
        }
      } catch (workflowError) {
        // Log workflow processing error but don't fail the image upload
        this.logger.warn(`Failed to process workflow for image ${savedImage.id}: ${(workflowError as Error).message}`);
      }

      // Update user's total uploads count
      await this.updateUserUploadCount(user.id);

      this.logger.log(`Successfully uploaded image: ${savedImage.id}${savedImage.hasWorkflow ? ' with workflow' : ''}`);

      return this.toImageResponseDto(savedImage);
    } catch (error) {
      this.logger.error(`Error uploading image: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  /**
   * Get image by ID
   */
  async getImageById(id: string, currentUser?: Users): Promise<ImageResponseDto> {
    const image = await this.imagesRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    // Check if user can access this image
    if (!image.isPublic && (!currentUser || currentUser.id !== image.user.id)) {
      throw new ForbiddenException('You do not have permission to access this image');
    }

    // Increment view count (only if not the owner)
    if (!currentUser || currentUser.id !== image.user.id) {
      await this.incrementViewCount(id);
    }

    return this.toImageResponseDto(image);
  }

  /**
   * Get images with pagination and filtering
   */
  async getImages(
    page: number = 1,
    limit: number = 20,
    isPublic: boolean = true,
    userId?: string,
  ): Promise<{ images: ImageResponseDto[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.imagesRepository
      .createQueryBuilder('image')
      .leftJoinAndSelect('image.user', 'user')
      .orderBy('image.createdAt', 'DESC');

    // Apply filters
    if (isPublic) {
      queryBuilder.andWhere('image.isPublic = :isPublic', { isPublic: true });
    }

    if (userId) {
      queryBuilder.andWhere('image.userId = :userId', { userId });
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [images, total] = await queryBuilder.getManyAndCount();

    return {
      images: images.map(image => this.toImageResponseDto(image)),
      total,
      page,
      limit,
    };
  }

  /**
   * Update image metadata
   */
  async updateImage(
    id: string,
    updateData: Partial<UploadImageDto>,
    currentUser: Users,
  ): Promise<ImageResponseDto> {
    const image = await this.imagesRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    // Check if user owns this image
    if (image.user.id !== currentUser.id) {
      throw new ForbiddenException('You can only update your own images');
    }

    // Update allowed fields
    if (updateData.title !== undefined) {
      image.title = updateData.title;
    }
    if (updateData.description !== undefined) {
      image.description = updateData.description;
    }
    if (updateData.isPublic !== undefined) {
      image.isPublic = updateData.isPublic;
    }
    if (updateData.generationParams !== undefined) {
      image.generationParams = updateData.generationParams ? {
        raw: updateData.generationParams,
      } : null;
    }

    const updatedImage = await this.imagesRepository.save(image);
    return this.toImageResponseDto(updatedImage);
  }

  /**
   * Delete image
   */
  async deleteImage(id: string, currentUser: Users): Promise<void> {
    const image = await this.imagesRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    // Check if user owns this image
    if (image.user.id !== currentUser.id) {
      throw new ForbiddenException('You can only delete your own images');
    }

    // Delete physical files
    await this.imageProcessingService.deleteImageVariants(
      currentUser.id,
      image.filename,
    );

    // Soft delete the image record
    await this.imagesRepository.softDelete(id);

    // Update user's total uploads count
    await this.updateUserUploadCount(currentUser.id, -1);

    this.logger.log(`Deleted image: ${id}`);
  }

  /**
   * Increment view count
   */
  private async incrementViewCount(imageId: string): Promise<void> {
    await this.imagesRepository
      .createQueryBuilder()
      .update(Images)
      .set({ viewCount: () => 'viewCount + 1' })
      .where('id = :id', { id: imageId })
      .execute();
  }

  /**
   * Update user's upload count
   */
  private async updateUserUploadCount(userId: string, increment: number = 1): Promise<void> {
    // This would update the Users entity - we'll implement this when we add user statistics
    this.logger.log(`User ${userId} upload count changed by ${increment}`);
  }

  /**
   * Generate default title from filename
   */
  private generateTitle(filename: string): string {
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    return nameWithoutExt
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Convert entity to response DTO
   */
  private toImageResponseDto(image: Images): ImageResponseDto {
    // Generate URLs from imagePath
    const baseUrl = image.imagePath.replace('/original/', '/');
    const filename = image.filename.replace(/\.[^/.]+$/, '');
    const ext = image.filename.split('.').pop();
    
    const urls = {
      thumbnail: `${baseUrl}thumbnails/${filename}.webp`,
      medium: `${baseUrl}medium/${filename}.webp`, 
      large: `${baseUrl}large/${filename}.webp`,
      original: image.imagePath,
    };

    return {
      id: image.id,
      title: image.title || '',
      description: image.description || '',
      filename: image.filename,
      urls,
      metadata: {
        width: image.width,
        height: image.height,
        format: (image.exifData as any)?.format || 'unknown',
        size: image.fileSize,
        aspectRatio: parseFloat(image.aspectRatio),
        hasAlpha: (image.exifData as any)?.hasAlpha || false,
        colorSpace: (image.exifData as any)?.colorSpace || 'unknown',
      },
      tags: [], // Will be implemented with tags system
      isPublic: image.isPublic ?? true,
      user: {
        id: image.user.id,
        username: image.user.username,
        displayName: image.user.displayName || image.user.username,
      },
      generationParams: (image.generationParams as any)?.raw,
      hasWorkflow: image.hasWorkflow ?? false,
      likeCount: image.likeCount || 0,
      viewCount: image.viewCount || 0,
      createdAt: image.uploadedAt || new Date(),
      updatedAt: image.updatedAt || new Date(),
    };
  }
}