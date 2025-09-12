import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Users } from '../entities/Users';

// Note: This interface is now deprecated as we only use OAuth
export interface CreateUserData {
  email: string;
  username: string;
  displayName?: string | null;
  isActive?: boolean;
  isVerified?: boolean;
  isAdmin?: boolean;
}

export interface CreateOAuthUserData {
  email: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  oauthProvider: string;
  oauthProviderId: string;
  isActive?: boolean;
  isVerified?: boolean;
  isAdmin?: boolean;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  /**
   * Create a new user (deprecated - use createOAuthUser instead)
   */
  async create(userData: CreateUserData): Promise<Users> {
    throw new Error('Traditional user creation is deprecated. Use OAuth login instead.');
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<Users | null> {
    return await this.usersRepository.findOne({
      where: { id },
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<Users | null> {
    return await this.usersRepository.findOne({
      where: { email },
    });
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<Users | null> {
    return await this.usersRepository.findOne({
      where: { username },
    });
  }

  /**
   * Find user by email or username
   */
  async findByEmailOrUsername(
    email: string,
    username: string,
  ): Promise<Users | null> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email OR user.username = :username', {
        email,
        username,
      })
      .getOne();
  }

  /**
   * Update user's last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.usersRepository.update(
      { id: userId },
      {
        lastLoginAt: new Date(),
        updateAt: new Date(),
      },
    );
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updateData: Partial<{
      displayName: string;
      bio: string;
      avatarUrl: string;
    }>,
  ): Promise<Users> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepository.update(
      { id: userId },
      {
        ...updateData,
        updateAt: new Date(),
      },
    );

    return await this.findById(userId) as Users;
  }

  /**
   * Find user by OAuth provider and provider ID
   */
  async findByOAuth(provider: string, providerId: string): Promise<Users | null> {
    return await this.usersRepository.findOne({
      where: {
        oauthProvider: provider,
        oauthProviderId: providerId,
      },
    });
  }

  /**
   * Create OAuth user
   */
  async createOAuthUser(userData: CreateOAuthUserData): Promise<Users> {
    const user = this.usersRepository.create({
      ...userData,
      totalUploads: 0,
      totalLikesReceived: 0,
      followerCount: 0,
      followingCount: 0,
      oauthConnectedAt: new Date(),
      createdAt: new Date(),
      updateAt: new Date(),
    });

    return await this.usersRepository.save(user);
  }

  /**
   * Link OAuth account to existing user
   */
  async linkOAuth(userId: string, provider: string, providerId: string): Promise<Users> {
    await this.usersRepository.update(
      { id: userId },
      {
        oauthProvider: provider,
        oauthProviderId: providerId,
        oauthConnectedAt: new Date(),
        updateAt: new Date(),
      },
    );

    return await this.findById(userId) as Users;
  }
}