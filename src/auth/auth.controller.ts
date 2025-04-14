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
import { User } from '../common/decorators/user.decorator';
import { FirebaseDecodedToken } from '../common/types/forebase-decoded-token.type';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @UseGuards(FirebaseAuthGuard)
  @Post('sync')
  async syncUser(@User() user: FirebaseDecodedToken) {
    if (!user) throw new UnauthorizedException();

    const dbUser = await this.userService.createFirebaseUser(user);
    return {
      message: 'ok',
      user: dbUser,
    };
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('set-role')
  async setUserRole(
    @User() user: FirebaseDecodedToken,
    @Body() body: { role?: string },
  ) {
    if (!user) throw new UnauthorizedException();

    const role = body.role || 'user';

    const claims: {
      role?: string;
      permissions?: string[];
    } = {};

    if (user.permissions && user.permissions.length > 0) {
      claims.permissions = user.permissions;
    }
    await this.authService.setUserClaims(user.uid, {
      ...claims,
      role,
    });

    return {
      message: 'ok',
    };
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('set-permissions')
  async setUserPermissions(
    @User() user: FirebaseDecodedToken,
    @Body() body: { permissions?: string[] },
  ) {
    if (!user) throw new UnauthorizedException();

    const permissions = body.permissions || [];

    const claims: {
      role?: string;
      permissions?: string[];
    } = {};
    if (user.role) {
      claims.role = user.role;
    }

    await this.authService.setUserClaims(user.uid, {
      ...claims,
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
