import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Get,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { ImagesService } from '../images/images.service';
import { CreatePostDto } from './dto/create-post.dto';
import { FindAllPostsDto } from './dto/find-all-posts.dto';
import { PaginatedPostsResponseDto } from './dto/paginated-posts.response.dto';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly imagesService: ImagesService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a new post with an image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image file and post data',
    type: CreatePostDto,
  })
  @ApiResponse({
    status: 201,
    description: 'The post has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
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
    // For now, we'll use a mock userId
    const userId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
    // 1. Create the post to get a post ID
    const newPost = await this.postsService.createPost(createPostDto, userId);

    // 2. Process and save the image, linking it to the new post
    const savedImage = await this.imagesService.processAndSaveImage(
      file,
      newPost.id,
      createPostDto.generationInfo,
    );

    // 3. Return the post with the image information
    // The image is already linked in the database, but we can return it for convenience
    newPost.images = [savedImage];
    return newPost;
  }

  @Get()
  @ApiOperation({ summary: 'Get a paginated list of posts' })
  @ApiQuery({
    name: 'cursor',
    required: false,
    type: String,
    description: 'The cursor for pagination.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'The number of items to return.',
  })
  @ApiResponse({
    status: 200,
    description: 'A paginated list of posts.',
    type: PaginatedPostsResponseDto,
  })
  async findAllPosts(
    @Query() findAllPostsDto: FindAllPostsDto,
  ): Promise<PaginatedPostsResponseDto> {
    return this.postsService.findAll(findAllPostsDto);
  }
}

