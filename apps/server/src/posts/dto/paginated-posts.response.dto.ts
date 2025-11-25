import { ApiProperty } from '@nestjs/swagger';
import { Posts } from '../../entities/Posts';

export class PaginatedPostsResponseDto {
  @ApiProperty({ type: [Posts] })
  data: Posts[];

  @ApiProperty({ type: String, nullable: true })
  cursor: string | null;

  @ApiProperty()
  hasMore: boolean;
}