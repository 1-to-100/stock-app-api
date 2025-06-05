import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DecodedIdToken } from 'firebase-admin/lib/auth';
import { UsersService } from '@/users/users.service';
import { OutputUserDto } from '@/users/dto/output-user.dto';
import { AuthService } from '@/auth/auth.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user: DecodedIdToken;
      headers: { authorization?: string };
      currentUser: null | OutputUserDto;
    }>();
    const token = request.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      request.user = await this.authService.verifyToken(token);

      const requestUser: { [p: string]: any } = request.user;
      console.log(requestUser);

      if (!requestUser.uid) {
        throw new ForbiddenException(
          'Access denied: request user uid not found, is it from Firebase?',
        );
      }

      request.currentUser = await this.usersService.findByUid(
        requestUser.uid as string,
      );
      console.log(request.currentUser);

      return true;
    } catch (error) {
      console.log('error', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
