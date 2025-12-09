import { Controller, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ImagesService } from './images.service';
import { UploadImageDto } from './dto/upload-image.dto';

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
    @Body() dto: UploadImageDto,
  ) {
    return this.imagesService.uploadImage(file, dto);
  }
}
