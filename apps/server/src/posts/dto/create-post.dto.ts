import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    description: 'The title of the post.',
    example: 'My awesome AI art',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'The description for the post.',
    required: false,
    example: 'Generated with Stable Diffusion v1.5',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The generation metadata extracted and edited by the user.',
    type: 'object',
    example: {
      prompt: 'a cat',
      negativePrompt: 'blurry',
      sampler: 'DPM++ 2M Karras',
    },
  })
  @IsObject()
  generationInfo: object;
}
