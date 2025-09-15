import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  ParseUUIDPipe,
  ParseIntPipe,
  ParseBoolPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { ImagesService } from './images.service';
import { UploadImageDto, ImageResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UploadThrottle } from '../auth/decorators/throttle.decorator';
import { Users } from '../entities/Users';
import { uploadConfig } from '../config/upload.config';

@ApiTags('Images')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('upload')
  @UploadThrottle()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 10, uploadConfig))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Upload images',
    description: 'Upload one or more images with metadata. Supports multiple resolutions and AI generation parameters.',
  })
  @ApiResponse({
    status: 201,
    description: 'Images uploaded successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          filename: { type: 'string' },
          urls: { type: 'object' },
          metadata: { type: 'object' },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid file format or size' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 429, description: 'Too many upload requests' })
  async uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadData: UploadImageDto,
    @GetUser() user: Users,
  ): Promise<ImageResponseDto[]> {
    if (!files || files.length === 0) {
      throw new Error('No files uploaded');
    }

    const uploadPromises = files.map(file => 
      this.imagesService.uploadImage(file, uploadData, user)
    );

    return await Promise.all(uploadPromises);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get images',
    description: 'Retrieve images with pagination and filtering options.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 20 })
  @ApiQuery({ name: 'public', required: false, type: Boolean, description: 'Filter by public/private', example: true })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'Filter by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Images retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        images: { type: 'array', items: { type: 'object' } },
        total: { type: 'number', example: 150 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 20 },
      },
    },
  })
  async getImages(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
    @Query('public', new ParseBoolPipe({ optional: true })) isPublic: boolean = true,
    @Query('userId') userId?: string,
  ) {
    return await this.imagesService.getImages(page, limit, isPublic, userId);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get image by ID',
    description: 'Retrieve a specific image by its ID. Increments view count.',
  })
  @ApiParam({ name: 'id', description: 'Image ID' })
  @ApiResponse({
    status: 200,
    description: 'Image retrieved successfully',
    schema: { type: 'object' },
  })
  @ApiResponse({ status: 404, description: 'Image not found' })
  @ApiResponse({ status: 403, description: 'Access denied to private image' })
  async getImageById(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() currentUser?: Users,
  ): Promise<ImageResponseDto> {
    return await this.imagesService.getImageById(id, currentUser);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Update image',
    description: 'Update image metadata. Only the image owner can perform this action.',
  })
  @ApiParam({ name: 'id', description: 'Image ID' })
  @ApiResponse({
    status: 200,
    description: 'Image updated successfully',
    schema: { type: 'object' },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Permission denied' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async updateImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: Partial<UploadImageDto>,
    @GetUser() currentUser: Users,
  ): Promise<ImageResponseDto> {
    return await this.imagesService.updateImage(id, updateData, currentUser);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete image',
    description: 'Delete an image and all its variants. Only the image owner can perform this action.',
  })
  @ApiParam({ name: 'id', description: 'Image ID' })
  @ApiResponse({ status: 204, description: 'Image deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Permission denied' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async deleteImage(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() currentUser: Users,
  ): Promise<void> {
    await this.imagesService.deleteImage(id, currentUser);
  }

  @Get('user/:userId')
  @ApiOperation({ 
    summary: 'Get images by user',
    description: 'Retrieve all public images uploaded by a specific user.',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 20 })
  @ApiResponse({
    status: 200,
    description: 'User images retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        images: { type: 'array', items: { type: 'object' } },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  async getImagesByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return await this.imagesService.getImages(page, limit, true, userId);
  }

  @Get('my/images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get my images',
    description: 'Retrieve all images uploaded by the current user (including private ones).',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 20 })
  @ApiResponse({
    status: 200,
    description: 'User images retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        images: { type: 'array', items: { type: 'object' } },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyImages(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
    @GetUser() currentUser: Users,
  ) {
    return await this.imagesService.getImages(page, limit, false, currentUser.id);
  }
}