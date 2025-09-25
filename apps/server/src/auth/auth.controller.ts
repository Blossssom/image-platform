import {
  Controller,
  Get,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { OAuthThrottle, AuthThrottle } from './decorators/throttle.decorator';
import { Users } from '../entities/Users';
import { OAuthCallbackDto } from './dto/oauth-callback.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('test-login')
  @AuthThrottle()
  @ApiOperation({ summary: 'Test login (development only)' })
  @ApiResponse({
    status: 200,
    description: 'Test token generated successfully',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        user: { type: 'object' }
      }
    }
  })
  async testLogin() {
    // Create or get a test user
    const testUser = await this.authService.findOrCreateTestUser();
    const token = this.authService.generateJwtToken(testUser);

    return {
      accessToken: token,
      user: {
        id: testUser.id,
        email: testUser.email,
        username: testUser.username,
        displayName: testUser.displayName
      }
    };
  }

  @Get('profile')
  @AuthThrottle()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: Object,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@GetUser() user: Users) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      isVerified: user.isVerified || false,
      isActive: user.isActive || false,
      totalUploads: user.totalUploads || 0,
      totalLikesReceived: user.totalLikesReceived || 0,
      followerCount: user.followerCount || 0,
      followingCount: user.followingCount || 0,
      createdAt: user.createdAt,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ 
    status: 200, 
    description: 'User successfully logged out',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Successfully logged out' }
      }
    }
  })
  async logout() {
    // For JWT tokens, logout is handled client-side by removing the token
    // In future, we might implement token blacklisting
    return { message: 'Successfully logged out' };
  }

  // OAuth Google Routes
  @Get('google')
  @OAuthThrottle()
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirect to Google OAuth' })
  async googleAuth(@Req() req: Request) {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ 
    status: 302, 
    description: 'Redirect to frontend with token',
  })
  @ApiResponse({ 
    status: 400, 
    description: 'OAuth validation failed',
  })
  async googleAuthRedirect(
    @Req() req: Request, 
    @Res() res: Response,
    @Query() query: OAuthCallbackDto
  ) {
    // Handle OAuth errors
    if (query.error) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(
        `${frontendUrl}/auth/error?error=${query.error}&description=${query.error_description || ''}`
      );
    }

    const authResult = req.user as any;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    res.redirect(
      `${frontendUrl}/auth/callback?token=${authResult.accessToken}`
    );
  }

  // OAuth GitHub Routes
  @Get('github')
  @OAuthThrottle()
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'GitHub OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirect to GitHub OAuth' })
  async githubAuth(@Req() req: Request) {
    // Guard redirects to GitHub
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  @ApiResponse({ 
    status: 302, 
    description: 'Redirect to frontend with token',
  })
  @ApiResponse({ 
    status: 400, 
    description: 'OAuth validation failed',
  })
  async githubAuthRedirect(
    @Req() req: Request, 
    @Res() res: Response,
    @Query() query: OAuthCallbackDto
  ) {
    // Handle OAuth errors
    if (query.error) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(
        `${frontendUrl}/auth/error?error=${query.error}&description=${query.error_description || ''}`
      );
    }

    const authResult = req.user as any;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    res.redirect(
      `${frontendUrl}/auth/callback?token=${authResult.accessToken}`
    );
  }

  // OAuth Facebook Routes
  @Get('facebook')
  @OAuthThrottle()
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Facebook OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirect to Facebook OAuth' })
  async facebookAuth(@Req() req: Request) {
    // Guard redirects to Facebook
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Facebook OAuth callback' })
  @ApiResponse({ 
    status: 302, 
    description: 'Redirect to frontend with token',
  })
  @ApiResponse({ 
    status: 400, 
    description: 'OAuth validation failed',
  })
  async facebookAuthRedirect(
    @Req() req: Request, 
    @Res() res: Response,
    @Query() query: OAuthCallbackDto
  ) {
    // Handle OAuth errors
    if (query.error) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(
        `${frontendUrl}/auth/error?error=${query.error}&description=${query.error_description || ''}`
      );
    }

    const authResult = req.user as any;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    res.redirect(
      `${frontendUrl}/auth/callback?token=${authResult.accessToken}`
    );
  }
}
