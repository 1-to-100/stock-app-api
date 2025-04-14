import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { RoleTestController } from './controllers/role-test.controller';

@Module({
  imports: [UsersModule],
  controllers: [AuthController, RoleTestController],
  providers: [AuthService],
})
export class AuthModule {}
