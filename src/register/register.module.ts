import { Module } from '@nestjs/common';
import { RegisterService } from './register.service';
import { RegisterController } from './register.controller';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Module({
  controllers: [RegisterController],
  providers: [RegisterService, PrismaService, UsersService],
  exports: [RegisterService],
})
export class RegisterModule {}
