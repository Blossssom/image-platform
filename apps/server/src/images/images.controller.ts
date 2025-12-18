import {
  Controller,
  Post,
  Patch,
  Get,
  UseInterceptors,
  UploadedFile,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ImagesService } from './images.service';
import { SearchHit, SearchResult } from '../search/search.service';
import { UploadImageDto } from './dto/upload-image.dto';
import { PublishImageDto } from './dto/publish-image.dto';
import { ImageDetailDto } from './dto/image-detail.dto';
import { GetImagesDto } from './dto/get-images.dto';

@ApiTags('Images')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload an image (Draft)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image file and optional metadata',
    type: UploadImageDto,
  })
  @ApiResponse({ status: 201, description: 'Image uploaded successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() _dto: UploadImageDto,
  ) {
    return this.imagesService.uploadImage(file);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish a drafted image' })
  @ApiResponse({ status: 200, description: 'Image published successfully' })
  @ApiResponse({
    status: 404,
    description: 'Image not found or not in DRAFT status',
  })
  async publishImage(@Param('id') id: string, @Body() dto: PublishImageDto) {
    return this.imagesService.publishImage(id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get image details' })
  @ApiResponse({
    status: 200,
    description: 'Image details',
    type: ImageDetailDto,
  })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async getImage(@Param('id') id: string): Promise<ImageDetailDto> {
    return this.imagesService.getImageDetail(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get gallery images' })
  @ApiResponse({ status: 200, description: 'Gallery list' })
  async getImages(
    @Query() dto: GetImagesDto,
  ): Promise<SearchResult<SearchHit>> {
    return this.imagesService.getImages(dto);
  }
}
