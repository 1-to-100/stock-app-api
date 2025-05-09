import { Module, Global } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { RoleTestController } from './controllers/role-test.controller';
import { FirebaseAuthGuard } from './guards/firebase-auth/firebase-auth.guard';
import { SupabaseAuthGuard } from './guards/supabase-auth/supabase-auth.guard';
import { DynamicAuthGuard } from './guards/dynamic-auth/dynamic-auth.guard';

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
