import { Module } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { RegisterController } from '@/register/register.controller';
import { RegisterService } from '@/register/register.service';
import { UsersService } from '@/users/users.service';

@Module({
  controllers: [RegisterController],
  providers: [RegisterService, PrismaService, UsersService],
  exports: [RegisterService],
})
export class RegisterModule {}
