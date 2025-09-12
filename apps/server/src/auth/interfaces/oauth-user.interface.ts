export interface OAuthUserData {
  provider: 'google' | 'facebook' | 'github';
  providerId: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
}