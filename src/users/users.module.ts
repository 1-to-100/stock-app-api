import { Module } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { RolesService } from '@/roles/roles.service';
import { UsersController } from '@/users/users.controller';
import { SystemUsersController } from '@/users/system-users.controller';
import { UsersService } from '@/users/users.service';

@Module({
  controllers: [UsersController, SystemUsersController],
  providers: [UsersService, PrismaService, RolesService],
  exports: [UsersService],
})
export class UsersModule {}
