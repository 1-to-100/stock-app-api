import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { UsersService } from '@/users/users.service';
import { OutputUserDto } from '@/users/dto/output-user.dto';

export type SupabaseDecodedToken = {
  uid: string; // sub
  email?: string;
  name?: string;
  picture?: string;
  role?: string;
  permissions?: string[];
  status?: string;
};

type supabaseJwtPayload =
  | (jwt.JwtPayload & {
      user_metadata: {
        full_name?: string;
        firstName?: string; // google
        lastName?: string; // google
        given_name?: string; // linkedin
        family_name?: string; // linkedin
        picture?: string;
      };
    })
  | null;

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly supabaseSecret: string = process.env.SUPABASE_JWT_SECRET!;

  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user: SupabaseDecodedToken;
      headers: { authorization?: string };
      currentUser: null | OutputUserDto;
    }>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Authorization header missing or invalid',
      );
    }

    const token = authHeader.split(' ')[1];
    const decodedPayload = jwt.verify(
      token,
      this.supabaseSecret,
    ) as supabaseJwtPayload;

    if (!decodedPayload || typeof decodedPayload !== 'object') {
      throw new UnauthorizedException('Invalid token');
    }

    const { firstName, lastName, full_name, given_name, family_name, picture } =
      decodedPayload.user_metadata || {};

    const fullName =
      full_name ||
      (firstName && lastName ? `${firstName} ${lastName}` : '') ||
      (given_name && family_name ? `${given_name} ${family_name}` : '');

    request.user = {
      uid: decodedPayload.sub!,
      email: decodedPayload.email as string,
      name: fullName,
      picture,
    };

    request.currentUser = await this.usersService.findByUid(request.user.uid);

    return true;
  }
}
