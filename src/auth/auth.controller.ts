import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from './guards/firebase-auth/firebase-auth.guard';
import { User, UserId } from '../common/decorators/user.decorator';
import { FirebaseDecodedToken } from '../common/types/forebase-decoded-token.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(FirebaseAuthGuard)
  @Post('sync')
  syncUser(@User() user: FirebaseDecodedToken) {
    if (!user) throw new UnauthorizedException();

    return {
      message: 'ok',
      user,
    };
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('set-role')
  async setUserRole(
    @UserId() userUid: string,
    @Body() body: { role?: string },
  ) {
    if (!userUid) throw new UnauthorizedException();

    const role = body.role || 'user';
    await this.authService.setUserClaims(userUid, {
      role,
    });

    return {
      message: 'ok',
    };
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('set-permissions')
  async setUserPermissions(
    @UserId() userUid: string,
    @Body() body: { permissions?: string[] },
  ) {
    if (!userUid) throw new UnauthorizedException();

    const permissions = body.permissions || [];
    await this.authService.setUserClaims(userUid, {
      permissions,
    });

    return {
      message: 'ok',
    };
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('test')
  testUserClaims() {
    return {
      message: 'test',
    };
    // const token = authHeader?.replace('Bearer ', '');
    //
    // try {
    //   const decoded: DecodedIdToken = await this.authService.verifyToken(token);
    //   if (!decoded) {
    //     throw new UnauthorizedException();
    //   }
    //
    //   return decoded;
    // } catch (error) {
    //   console.log('error', error);
    //   throw new UnauthorizedException();
    // }
  }
}
