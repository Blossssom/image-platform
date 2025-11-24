import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PostsService } from './posts.service';
import { Posts } from '../entities/Posts';
import { Images } from '../entities/Images';

// Simplified mock repository
const mockPostsRepository = {
  create: jest.fn(),
  save: jest.fn(),
};

describe('PostsService', () => {
  let service: PostsService;
  let repository: typeof mockPostsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(Posts),
          useValue: mockPostsRepository,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    repository = module.get(getRepositoryToken(Posts));
    // Reset mocks before each test
    repository.create.mockClear();
    repository.save.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPostWithImage', () => {
    it('should create and save a new post with an image', async () => {
      const createPostDto = { title: 'Test Post', description: 'Test Desc' };
      const image = new Images(); // A mock/dummy image entity
      image.id = 'mock-image-id';

      const newPost = {
        id: 'mock-post-id',
        ...createPostDto,
        images: [image],
      };

      repository.create.mockReturnValue(newPost);
      repository.save.mockResolvedValue(newPost);

      const result = await service.createPostWithImage(createPostDto, image);

      expect(repository.create).toHaveBeenCalledWith({
        ...createPostDto,
        images: [image],
      });
      expect(repository.save).toHaveBeenCalledWith(newPost);
      expect(result).toEqual(newPost);
    });
  });
});
