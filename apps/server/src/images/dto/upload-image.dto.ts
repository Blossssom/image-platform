import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Allow } from 'class-validator';
import { IUploadImageBody } from '@shared/types';

export class UploadImageDto implements IUploadImageBody {
  @ApiProperty({
    description: 'Image file to upload',
    type: 'string',
    format: 'binary',
  })
  @Allow()
  file: any;

  @ApiProperty({
    description: 'User nickname (Optional for Guest)',
    required: false,
  })
  @IsOptional()
  @IsString()
  nickname?: string;
}
