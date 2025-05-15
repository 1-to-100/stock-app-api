import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { RolesService } from '../roles/roles.service';
import { SystemUsersController } from './system-users.controller';

@Module({
  controllers: [UsersController, SystemUsersController],
  providers: [UsersService, PrismaService, AuthService, RolesService],
  exports: [UsersService],
})
export class UsersModule {}
