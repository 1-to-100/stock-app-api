import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';

@Module({
  controllers: [CustomersController],
  providers: [CustomersService, PrismaService, AuthService, UsersService],
  exports: [CustomersService],
})
export class CustomersModule {}
