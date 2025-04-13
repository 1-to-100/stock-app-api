import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { DecodedIdToken } from 'firebase-admin/lib/auth';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sync')
  async syncUser(
    @Body()
    body: {
      idToken: string;
      email?: string;
      name?: string;
      avatar?: string;
    },
    @Headers('authorization') authHeader: string,
  ) {
    const token = authHeader?.replace('Bearer ', '');

    try {
      const decoded: DecodedIdToken = await this.authService.verifyToken(token);
      if (!decoded) {
        throw new UnauthorizedException('Invalid token');
      }

      console.log('decoded token', decoded);
      console.log('uid', decoded.uid);
    } catch (error) {
      console.log('error', error);
      throw new UnauthorizedException('Invalid secret');
    }
  }

  @Post('set-claims')
  async setUserClaims(
    @Body()
    body: {
      uid: string;
      permissions: string[];
    },
    @Headers('authorization') authHeader: string,
  ) {
    const token = authHeader?.replace('Bearer ', '');

    const decoded: DecodedIdToken = await this.authService.verifyToken(token);
    if (!decoded) {
      throw new UnauthorizedException('Invalid token');
    }

    const permissions = body.permissions || [];

    return this.authService.setUserClaims(decoded.uid, {
      permissions,
    });
  }

  @Get('test')
  async testUserClaims(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');

    try {
      const decoded: DecodedIdToken = await this.authService.verifyToken(token);
      if (!decoded) {
        throw new UnauthorizedException();
      }

      return decoded;
    } catch (error) {
      console.log('error', error);
      throw new UnauthorizedException();
    }
  }
}
