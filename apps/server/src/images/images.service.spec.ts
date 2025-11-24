import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ImagesService } from './images.service';
import { S3Service } from '../common/services/s3.service';
import { Images } from '../entities/Images';

// Mock S3Service
const mockS3Service = {
  uploadFile: jest.fn(),
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
          provide: S3Service,
          useValue: mockS3Service,
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
    mockS3Service.uploadFile.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parseMetadata', () => {
    it('should return an empty object if parsing fails', async () => {
      const invalidBuffer = Buffer.from('not a real image');
      // Accessing private method for testing purposes
      const metadata = await (service as any).parseMetadata(invalidBuffer);
      expect(metadata).toEqual({ source: 'error', data: {} });
    });

    // To test the success cases, actual image files with A1111 and ComfyUI
    // metadata would be needed, which cannot be created here.
    // This test serves as a demonstration of the overall testing structure.
  });
});
