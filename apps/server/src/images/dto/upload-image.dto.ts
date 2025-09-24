import { IsString, IsOptional, IsArray, MaxLength, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UploadImageDto {
  @ApiProperty({
    description: 'Image title',
    example: 'Beautiful landscape generated with ComfyUI',
    maxLength: 200,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @ApiProperty({
    description: 'Image description',
    example: 'A stunning mountain landscape created using ComfyUI workflow',
    maxLength: 1000,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: 'Tags for the image',
    example: ['landscape', 'comfyui', 'ai-art', 'mountains'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }
    return value;
  })
  tags?: string[];

  @ApiProperty({
    description: 'Whether the image is public or private',
    example: true,
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return value;
  })
  isPublic?: boolean = true;

  @ApiProperty({
    description: 'Generation parameters (A1111/ComfyUI)',
    example: 'Steps: 20, Sampler: DPM++ 2M Karras, CFG scale: 7, Seed: 123456789',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  generationParams?: string;

  @ApiProperty({
    description: 'ComfyUI workflow JSON data',
    example: { nodes: [], links: [] },
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    }
    return value;
  })
  workflowData?: object;

  @ApiProperty({
    description: 'Workflow title',
    example: 'Advanced LoRA Portrait Workflow',
    maxLength: 200,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  workflowTitle?: string;

  @ApiProperty({
    description: 'Workflow description',
    example: 'A complex workflow using multiple LoRAs for high-quality portrait generation',
    maxLength: 1000,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  workflowDescription?: string;

  @ApiProperty({
    description: 'Workflow category',
    example: 'portrait',
    maxLength: 50,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  workflowCategory?: string;
}