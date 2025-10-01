import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-linkedin-oauth2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class LinkedInStrategy extends PassportStrategy(Strategy, 'linkedin') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get('oauth.linkedin.clientId'),
      clientSecret: configService.get('oauth.linkedin.clientSecret'),
      callbackURL: configService.get('oauth.linkedin.callbackURL'),
      scope: ['r_emailaddress', 'r_liteprofile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const user = await this.authService.validateOAuthUser({
      email: profile.emails[0].value,
      firstName: profile.name?.givenName || profile.displayName,
      lastName: profile.name?.familyName || '',
      avatar: profile.photos[0]?.value,
      provider: 'LINKEDIN',
      providerId: profile.id,
    });

    return user;
  }
}
