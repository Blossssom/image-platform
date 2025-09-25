import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { OAuthUserData } from './interfaces/oauth-user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}


  /**
   * Validate JWT payload
   */
  async validateUser(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }

  /**
   * Validate OAuth user - create if doesn't exist, update if exists
   */
  async validateOAuthUser(oauthData: OAuthUserData): Promise<any> {
    const { provider, providerId, email, username, displayName, avatarUrl } = oauthData;

    // First, try to find user by OAuth provider and ID
    let user = await this.usersService.findByOAuth(provider, providerId);

    if (!user) {
      // If not found by OAuth, try to find by email
      user = await this.usersService.findByEmail(email);

      if (user) {
        // User exists with email but no OAuth - link the account
        user = await this.usersService.linkOAuth(user.id, provider, providerId);
      } else {
        // Create new user
        user = await this.usersService.createOAuthUser({
          email,
          username: await this.generateUniqueUsername(username),
          displayName,
          avatarUrl,
          oauthProvider: provider,
          oauthProviderId: providerId,
          isActive: true,
          isVerified: true, // OAuth users are considered verified
        });
      }
    }

    // Generate JWT token
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified || false,
        isActive: user.isActive || false,
        oauthProvider: user.oauthProvider,
      },
    };
  }

  /**
   * Generate JWT token for user
   */
  generateJwtToken(user: any): string {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  /**
   * Find or create test user for development
   */
  async findOrCreateTestUser() {
    const testEmail = 'test@example.com';
    let user = await this.usersService.findByEmail(testEmail);

    if (!user) {
      user = await this.usersService.createOAuthUser({
        email: testEmail,
        username: 'testuser',
        displayName: 'Test User',
        avatarUrl: null,
        oauthProvider: 'test',
        oauthProviderId: 'test-123',
        isActive: true,
        isVerified: true,
      });
    }

    return user;
  }

  /**
   * Generate unique username for OAuth users
   */
  private async generateUniqueUsername(baseUsername: string): Promise<string> {
    let username = baseUsername.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    let counter = 1;

    while (await this.usersService.findByUsername(username)) {
      username = `${baseUsername.toLowerCase().replace(/[^a-z0-9_]/g, '_')}_${counter}`;
      counter++;
    }

    return username;
  }
}