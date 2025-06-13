import { Module } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { UsersService } from '@/users/users.service';
import { RolesController } from '@/roles/roles.controller';
import { RolesService } from '@/roles/roles.service';

@Module({
  controllers: [RolesController],
  providers: [RolesService, PrismaService, UsersService],
})
export class RolesModule {}
