import { ConflictException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';
import {
  getDomainFromEmail,
  isPublicEmailDomain,
} from '../common/helpers/string-helpers';
import { UsersService } from '../users/users.service';
import { supabaseClientAuth } from '../common/helpers/supabase-client';
import { FrontendPaths } from '../common/helpers/frontend-paths';

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

    const existingCustomer = await this.prisma.customer.findFirst({
      where: { domain },
    });

    const newUser = await this.usersService.create(
      {
        email,
        firstName,
        lastName,
        customerId: existingCustomer?.id,
      },
      true,
    );

    if (!existingCustomer) {
      const newCustomer = await this.prisma.customer.create({
        data: { name: domain, email, domain, ownerId: newUser.id },
      });

      await this.prisma.user.update({
        where: { id: newUser.id },
        data: { customerId: newCustomer.id },
      });
    }

    // Sign up in Supabase
    await this.signUpInSupabase(registerDto);

    return newUser;
  }

  // TODO: Винести в окремий сервіс
  private async signUpInSupabase(registerDto: RegisterDto) {
    return supabaseClientAuth.signUp({
      email: registerDto.email,
      password: registerDto.password,
      options: {
        emailRedirectTo: FrontendPaths.callbackPkce,
        data: {
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
        },
      },
    });
  }
}
