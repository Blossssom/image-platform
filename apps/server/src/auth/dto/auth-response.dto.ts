import { ApiProperty } from '@nestjs/swagger';

export interface AuthResponseDto {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    provider: string;
    isVerified: boolean;
  };
}