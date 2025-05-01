import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';

@Module({
  controllers: [RolesController],
  providers: [RolesService, PrismaService, AuthService, UsersService],
})
export class RolesModule {}
