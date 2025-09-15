import { ApiProperty } from '@nestjs/swagger';

export interface ImageUrlsDto {
  thumbnail: string;
  medium: string;
  large: string;
  original: string;
}

export interface ImageMetadataDto {
  width: number;
  height: number;
  format: string;
  size: number;
  aspectRatio: number;
  hasAlpha: boolean;
  colorSpace: string;
}

export interface ImageResponseDto {
  id: string;
  title: string;
  description: string;
  filename: string;
  urls: ImageUrlsDto;
  metadata: ImageMetadataDto;
  tags: string[];
  isPublic: boolean;
  user: {
    id: string;
    username: string;
    displayName: string;
  };
  generationParams?: string;
  hasWorkflow: boolean;
  likeCount: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}