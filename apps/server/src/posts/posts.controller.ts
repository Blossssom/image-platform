import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { ImagesService } from '../images/images.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly imagesService: ImagesService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPost(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }), // 20MB
          new FileTypeValidator({ fileType: 'image/png' }), // Only allow PNG for now
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() createPostDto: CreatePostDto,
  ) {
    // 1. Process and save the image, get the saved Image entity
    const savedImage = await this.imagesService.processAndSaveImage(file);

    // 2. Create the post and link the image to it
    const newPost = await this.postsService.createPostWithImage(
      createPostDto,
      savedImage,
    );

    return newPost;
  }
}
