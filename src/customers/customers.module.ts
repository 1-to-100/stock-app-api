import { Module } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { AuthService } from '@/auth/auth.service';
import { CustomersController } from '@/customers/customers.controller';
import { CustomersService } from '@/customers/customers.service';
import { UsersService } from '@/users/users.service';

@Module({
  controllers: [CustomersController],
  providers: [CustomersService, PrismaService, AuthService, UsersService],
  exports: [CustomersService],
})
export class CustomersModule {}
