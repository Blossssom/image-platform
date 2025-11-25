import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ImagesService } from './images.service';
import { StorageService } from '../common/services/storage.service';
import { Images } from '../entities/Images';

// Mock StorageService
const mockStorageService = {
  save: jest.fn(),
  delete: jest.fn(),
};

// Simplified mock repository
const mockImagesRepository = {
  create: jest.fn(),
  save: jest.fn(),
};

describe('ImagesService', () => {
  let service: ImagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagesService,
        {
          provide: 'StorageService',
          useValue: mockStorageService,
        },
        {
          provide: getRepositoryToken(Images),
          useValue: mockImagesRepository,
        },
      ],
    }).compile();

    service = module.get<ImagesService>(ImagesService);

    // Reset mocks before each test
    mockImagesRepository.create.mockClear();
    mockImagesRepository.save.mockClear();
    mockStorageService.save.mockClear();
    mockStorageService.delete.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processAndSaveImage', () => {
    it('should process and save an image', async () => {
      // A valid 1x1 pixel red PNG buffer
      const Png1x1 =
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/epv2AAAAABJRU5ErkJggg==';
      const file = {
        buffer: Buffer.from(Png1x1, 'base64'),
        originalname: 'test.png',
        mimetype: 'image/png',
      } as Express.Multer.File;
      const postId = 'mock-post-id';
      const generationInfo = { prompt: 'a cat' };

      const saveResult = { url: 'mock-url', path: 'mock-path' };
      mockStorageService.save.mockResolvedValue(saveResult);

      const newImage = new Images();
      mockImagesRepository.create.mockReturnValue(newImage);
      mockImagesRepository.save.mockResolvedValue(newImage);

      const result = await service.processAndSaveImage(
        file,
        postId,
        generationInfo,
      );

      expect(mockStorageService.save).toHaveBeenCalledTimes(3);
      expect(mockImagesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          post: { id: postId },
          generationInfo: generationInfo,
        }),
      );
      expect(mockImagesRepository.save).toHaveBeenCalledWith(newImage);
      expect(result).toBe(newImage);
    });
  });

  describe('parseMetadata', () => {
    it('should return an empty object if parsing fails', async () => {
      const invalidBuffer = Buffer.from('not a real image');
      // Accessing private method for testing purposes
      const metadata = await (service as any).parseMetadata(invalidBuffer);
      expect(metadata).toEqual({ source: 'error', data: {} });
    });
  });
});
