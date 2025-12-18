import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum ImageSort {
  LATEST = 'latest',
  POPULAR = 'popular',
}

export enum ImagePeriod {
  ALL = 'all',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export class GetImagesDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit: number = 20;

  @ApiProperty({ enum: ImageSort, required: false, default: ImageSort.LATEST })
  @IsOptional()
  @IsEnum(ImageSort)
  sort: ImageSort = ImageSort.LATEST;

  @ApiProperty({ enum: ImagePeriod, required: false, default: ImagePeriod.ALL })
  @IsOptional()
  @IsEnum(ImagePeriod)
  period: ImagePeriod = ImagePeriod.ALL;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  modelId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  username?: string;

  // Potential future filters: tag, tool, nsfw, etc.
}
