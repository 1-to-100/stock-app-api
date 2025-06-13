import {
  Controller,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { SupabaseUser } from '@/common/decorators/supabase-user.decorator';
import { UsersService } from '@/users/users.service';
import { DynamicAuthGuard } from '@/auth/guards/dynamic-auth/dynamic-auth.guard';
import { SupabaseDecodedToken } from '@/auth/guards/supabase-auth/supabase-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UsersService) {}

  @UseGuards(DynamicAuthGuard)
  @Post('sync/supabase')
  async syncSupabaseUser(@SupabaseUser() user: SupabaseDecodedToken) {
    if (!user) throw new UnauthorizedException();
    const dbUser = await this.userService.createSupabaseUser(user);

    return {
      message: 'ok',
      user: dbUser,
    };
  }
}
