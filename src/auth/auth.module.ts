import { Module, Global } from '@nestjs/common';
import { UsersModule } from '@/users/users.module';
import { AuthController } from '@/auth/auth.controller';
import { RoleTestController } from '@/auth/controllers/role-test.controller';
import { AuthService } from '@/auth/auth.service';
import { FirebaseAuthGuard } from '@/auth/guards/firebase-auth/firebase-auth.guard';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth/supabase-auth.guard';
import { DynamicAuthGuard } from '@/auth/guards/dynamic-auth/dynamic-auth.guard';

@Global()
@Module({
  imports: [UsersModule],
  controllers: [AuthController, RoleTestController],
  providers: [
    AuthService,
    FirebaseAuthGuard,
    SupabaseAuthGuard,
    DynamicAuthGuard,
  ],
  exports: [FirebaseAuthGuard, SupabaseAuthGuard, DynamicAuthGuard],
})
export class AuthModule {}
