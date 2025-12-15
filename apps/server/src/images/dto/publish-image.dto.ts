import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsEnum, IsBoolean, Length } from 'class-validator';
import { GenerationTool, GenerationMethod } from '../constants';

export class PublishImageDto {
  @ApiProperty({ description: 'Title of the image', maxLength: 255 })
  @IsString()
  @Length(1, 255)
  title: string;

  @ApiPropertyOptional({ description: 'Description of the image' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Tags for the image', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Whether the image contains NSFW content' })
  @IsOptional()
  @IsBoolean()
  isNsfw?: boolean;

  @ApiPropertyOptional({ enum: GenerationTool, description: 'Generation tool used' })
  @IsOptional()
  @IsEnum(GenerationTool)
  generationTool?: GenerationTool;

  @ApiPropertyOptional({ enum: GenerationMethod, description: 'Generation method used' })
  @IsOptional()
  @IsEnum(GenerationMethod)
  generationMethod?: GenerationMethod;

  @ApiPropertyOptional({ description: 'Positive prompt' })
  @IsOptional()
  @IsString()
  positivePrompt?: string;

  @ApiPropertyOptional({ description: 'Negative prompt' })
  @IsOptional()
  @IsString()
  negativePrompt?: string;

  @ApiPropertyOptional({ description: 'Model hash or name' })
  @IsOptional()
  @IsString()
  modelHash?: string;

  @ApiPropertyOptional({ description: 'Sampler name' })
  @IsOptional()
  @IsString()
  sampler?: string;

  @ApiPropertyOptional({ description: 'Steps count' })
  @IsOptional()
  // @IsNumber() - incoming might be string or number, handled by validation pipe or manual cast if needed. 
  // Let's stick to simple types usually used in JSON bodies for update.
  steps?: number;

  @ApiPropertyOptional({ description: 'CFG Scale' })
  @IsOptional()
  cfgScale?: number;

  @ApiPropertyOptional({ description: 'Seed' })
  @IsOptional()
  @IsString()
  seed?: string;

  @ApiPropertyOptional({ 
    description: 'List of used resources (LoRA, Checkpoint, etc.)',
    example: [{ type: 'lora', name: 'KoreanDollLikeness', weight: 0.8 }]
  })
  @IsOptional()
  @IsArray()
  resources?: Record<string, any>[];
  
  // workflow and rawParams usually strictly from file, unlikely user manually inputs massive JSON, 
  // but we can allow if really needed. For now let's stick to editable text/numbers.
}
