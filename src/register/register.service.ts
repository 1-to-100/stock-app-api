import { ConflictException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';
import {
  getDomainFromEmail,
  isPublicEmailDomain,
} from '../common/helpers/string-helpers';
import { UsersService } from '../users/users.service';
import { OutputUserDto } from 'src/users/dto/output-user.dto';

@Injectable()
export class RegisterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { firstName, lastName, email } = registerDto;

    const domain = getDomainFromEmail(email);
    if (!domain) {
      throw new ConflictException(
        'Email address does not contain a valid domain',
      );
    }
    if (isPublicEmailDomain(domain)) {
      throw new ConflictException('Email address is not a company address');
    }

    let existingCustomer = await this.prisma.customer.findFirst({
      where: { domain },
    });

    let newUser: OutputUserDto;
    if (existingCustomer) {
      newUser = await this.usersService.create({
        email: email,
        firstName: firstName,
        lastName: lastName,
        customerId: existingCustomer.id,
      });
    } else {
      newUser = await this.usersService.create({
        email: email,
        firstName: firstName,
        lastName: lastName,
      });

      existingCustomer = await this.prisma.customer.create({
        data: {
          name: domain,
          email: email,
          domain: domain,
          ownerId: newUser.id,
        },
      });

      await this.prisma.user.update({
        where: { id: newUser.id },
        data: { customerId: existingCustomer.id },
      });
    }

    await this.usersService.sendInviteEmail(newUser);
    return newUser;
  }
}
