import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PostsService } from './posts.service';
import { Posts } from '../entities/Posts';
import { Images } from '../entities/Images';
import { Users } from '../entities/Users';
import { NotFoundException } from '@nestjs/common';

// Simplified mock repository
const mockQueryBuilder = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  addOrderBy: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getMany: jest.fn(),
};

const mockPostsRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
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
    repository.findOne.mockClear();
    mockQueryBuilder.getMany.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPost', () => {
    it('should create and save a new post', async () => {
      const createPostDto = {
        title: 'Test Post',
        description: 'Test Desc',
        generationInfo: { prompt: 'a test prompt' },
      };
      const userId = 'mock-user-id';
      
      const newPost = {
        id: 'mock-post-id',
        title: 'Test Post',
        description: 'Test Desc',
        userId,
      };

      // The service spreads the DTO, and TypeORM's `create` handles the properties.
      repository.create.mockReturnValue(newPost);
      repository.save.mockResolvedValue(newPost);

      const result = await service.createPost(createPostDto, userId);

      expect(repository.create).toHaveBeenCalledWith({
        ...createPostDto,
        userId,
      });
      expect(repository.save).toHaveBeenCalledWith(newPost);
      expect(result).toEqual(newPost);
    });
  });

  describe('findAll', () => {
    const mockUser = new Users();
    mockUser.id = 'mock-user-id';

    const mockPosts: Posts[] = [
      {
        id: 'post1',
        title: 'Post 1',
        description: 'Description 1',
        viewCount: 0,
        userId: 'user1',
        createdAt: new Date('2025-01-01T10:00:00Z'),
        updatedAt: new Date('2025-01-01T10:00:00Z'),
        deletedAt: null,
        images: [],
        user: mockUser,
      },
      {
        id: 'post2',
        title: 'Post 2',
        description: 'Description 2',
        viewCount: 0,
        userId: 'user1',
        createdAt: new Date('2025-01-01T09:00:00Z'),
        updatedAt: new Date('2025-01-01T09:00:00Z'),
        deletedAt: null,
        images: [],
        user: mockUser,
      },
      {
        id: 'post3',
        title: 'Post 3',
        description: 'Description 3',
        viewCount: 0,
        userId: 'user1',
        createdAt: new Date('2025-01-01T08:00:00Z'),
        updatedAt: new Date('2025-01-01T08:00:00Z'),
        deletedAt: null,
        images: [],
        user: mockUser,
      },
    ];

    it('should return posts with default limit and hasMore false if less than limit', async () => {
      // Mock getMany to return 2 posts when limit is 10 (or 11 including hasMore check)
      repository.createQueryBuilder().getMany.mockResolvedValue(mockPosts.slice(0, 2));

      const result = await service.findAll({});

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('post');
      expect(repository.createQueryBuilder().leftJoinAndSelect).toHaveBeenCalledWith('post.images', 'image');
      expect(repository.createQueryBuilder().orderBy).toHaveBeenCalledWith('post.createdAt', 'DESC');
      expect(repository.createQueryBuilder().addOrderBy).toHaveBeenCalledWith('post.id', 'DESC');
      expect(repository.createQueryBuilder().take).toHaveBeenCalledWith(11); // default limit + 1
      expect(result.data).toEqual(mockPosts.slice(0, 2));
      expect(result.hasMore).toBe(false);
      expect(result.cursor).toBe('post2');
    });

    it('should return posts with specified limit and hasMore true if more than limit', async () => {
      const query = { limit: 2 };
      // Mock getMany to return 3 posts (limit 2 + 1 for hasMore check)
      repository.createQueryBuilder().getMany.mockResolvedValue(mockPosts);

      const result = await service.findAll(query);

      expect(repository.createQueryBuilder().take).toHaveBeenCalledWith(3); // limit + 1
      expect(result.data).toEqual(mockPosts.slice(0, 2));
      expect(result.hasMore).toBe(true);
      expect(result.cursor).toBe('post2');
    });

    it('should return posts starting from a cursor', async () => {
      const query = { cursor: 'post2', limit: 1 };
      const cursorPost = mockPosts[1]; // post2
      repository.findOne.mockResolvedValue(cursorPost);

      // Mock getMany to return posts after post2 (i.e., post3)
      repository.createQueryBuilder().getMany.mockResolvedValue([mockPosts[2]]);

      const result = await service.findAll(query);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'post2' } });
      expect(repository.createQueryBuilder().andWhere).toHaveBeenCalledWith(
        '(post.createdAt < :cursorCreatedAt OR (post.createdAt = :cursorCreatedAt AND post.id < :cursorId))',
        { cursorCreatedAt: cursorPost.createdAt, cursorId: cursorPost.id },
      );
      expect(repository.createQueryBuilder().take).toHaveBeenCalledWith(2); // limit + 1
      expect(result.data).toEqual([mockPosts[2]]);
      expect(result.hasMore).toBe(false);
      expect(result.cursor).toBe('post3');
    });

    it('should throw NotFoundException if cursor post is not found', async () => {
      const query = { cursor: 'non-existent-cursor', limit: 10 };
      repository.findOne.mockResolvedValue(null);

      await expect(service.findAll(query)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'non-existent-cursor' } });
    });

    it('should return empty array if no posts are found', async () => {
      repository.createQueryBuilder().getMany.mockResolvedValue([]);

      const result = await service.findAll({});

      expect(result.data).toEqual([]);
      expect(result.hasMore).toBe(false);
      expect(result.cursor).toBeNull();
    });
  });
});

