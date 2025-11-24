import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ImagesService } from '../src/images/images.service';
import { PostsService } from '../src/posts/posts.service';

describe('PostsController (e2e)', () => {
  let app: INestApplication;

  // Mock services
  const mockImagesService = {
    processAndSaveImage: jest.fn(),
  };
  const mockPostsService = {
    createPostWithImage: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ImagesService)
      .useValue(mockImagesService)
      .overrideProvider(PostsService)
      .useValue(mockPostsService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe()); // Add validation pipe for DTO tests
    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/posts/upload (POST) - should handle file upload and create a post', async () => {
    const mockImageEntity = { id: 'image-uuid', urlOriginal: 'original' };
    const mockPostEntity = {
      id: 'post-uuid',
      title: 'Test Title',
      images: [mockImageEntity],
    };

    mockImagesService.processAndSaveImage.mockResolvedValue(mockImageEntity);
    mockPostsService.createPostWithImage.mockResolvedValue(mockPostEntity);

    const fileBuffer = Buffer.from('__test_file_content__');

    const response = await request(app.getHttpServer())
      .post('/posts/upload')
      .attach('file', fileBuffer, 'test-image.png')
      .field('title', 'Test Title')
      .field('description', 'Test Description')
      .expect(201); // Expect 201 Created

    expect(mockImagesService.processAndSaveImage).toHaveBeenCalled();
    expect(mockPostsService.createPostWithImage).toHaveBeenCalledWith(
      { title: 'Test Title', description: 'Test Description' },
      mockImageEntity,
    );
    expect(response.body.id).toEqual('post-uuid');
    expect(response.body.title).toEqual('Test Title');
  });

  it('/posts/upload (POST) - should return 400 if title is missing', async () => {
    const fileBuffer = Buffer.from('__test_file_content__');

    await request(app.getHttpServer())
      .post('/posts/upload')
      .attach('file', fileBuffer, 'test-image.png')
      .field('description', 'Test Description')
      .expect(400);

    expect(mockImagesService.processAndSaveImage).not.toHaveBeenCalled();
  });
});
