import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ImagesService } from './images.service';
import { Images } from '../entities/Images';

@ApiTags('images')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get image details by ID' })
  @ApiResponse({
    status: 200,
    description: 'The image details.',
    type: Images,
  })
  @ApiResponse({ status: 404, description: 'Image not found.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Images> {
    return this.imagesService.findOne(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Get a pre-signed URL to download the original image' })
  @ApiResponse({
    status: 200,
    description: 'A pre-signed URL for the original image.',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example: 'https://s3.amazonaws.com/bucket/path/to/image.png?AWSAccessKeyId=...',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Image not found.' })
  async getDownloadUrl(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ url: string }> {
    const url = await this.imagesService.getDownloadUrl(id);
    return { url };
  }
}
