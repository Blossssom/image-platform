import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

import { AuthService } from '../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    const clientID = configService.get<string>('FACEBOOK_APP_ID');
    const clientSecret = configService.get<string>('FACEBOOK_APP_SECRET');
    const callbackURL = configService.get<string>('FACEBOOK_CALLBACK_URL');

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('Facebook OAuth configuration is missing');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      profileFields: ['id', 'emails', 'name', 'picture'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    const { name, emails, photos, id } = profile;
    
    const user = await this.authService.validateOAuthUser({
      provider: 'facebook',
      providerId: id,
      email: emails?.[0]?.value || `${id}@facebook.local`,
      username: `${name.givenName}_${name.familyName}`.toLowerCase().replace(/\s+/g, '_'),
      displayName: `${name.givenName} ${name.familyName}`,
      avatarUrl: photos?.[0]?.value || null,
    });

    return user;
  }
}