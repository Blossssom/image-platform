import { ApiProperty } from '@nestjs/swagger';
import { GenerationTool, GenerationMethod } from '@shared/types';

export class ImageDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  urlOriginal: string;

  @ApiProperty()
  urlThumbnail: string;

  @ApiProperty()
  width: number;

  @ApiProperty()
  height: number;

  @ApiProperty()
  isNsfw: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ nullable: true })
  title?: string;

  @ApiProperty({ nullable: true })
  description?: string;

  @ApiProperty({ nullable: true })
  generationTool?: GenerationTool;

  @ApiProperty({ nullable: true })
  generationMethod?: GenerationMethod;

  @ApiProperty({ nullable: true })
  positivePrompt?: string;

  @ApiProperty({ nullable: true })
  negativePrompt?: string;

  @ApiProperty({ nullable: true })
  modelHash?: string;

  @ApiProperty({ type: [String], nullable: true })
  tags?: string[];

  @ApiProperty({ nullable: true })
  sampler?: string;

  @ApiProperty({ nullable: true })
  steps?: number;

  @ApiProperty({ nullable: true })
  cfgScale?: number;

  @ApiProperty({ nullable: true })
  seed?: string;

  @ApiProperty({ description: 'User nickname', nullable: true })
  userNickname?: string;

  // TODO: Add resources and stats when robustly available
  @ApiProperty({
    type: 'object',
    nullable: true,
    description: 'JSONB resources',
    additionalProperties: true,
  })
  resources?: any;
}
