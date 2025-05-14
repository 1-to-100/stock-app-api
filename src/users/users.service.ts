import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseDecodedToken } from '../common/types/forebase-decoded-token.type';
import { FirebaseAdmin, InjectFirebaseAdmin } from 'nestjs-firebase';
import { InviteUserDto } from './dto/invite-user.dto';
import { CheckUserExistsDto } from './dto/check-user-exists.dto';
import { ListUsersInputDto } from './dto/list-users-input.dto';
import { PaginatedOutputDto } from '../common/dto/paginated-output.dto';
import { OutputUserDto } from './dto/output-user.dto';
import { createPaginator } from 'prisma-pagination';
import { CustomerStatus, Prisma } from '@prisma/client';
import {
  getDomainFromEmail,
  isPublicEmailDomain,
} from '../common/helpers/string-helpers';
import { SupabaseDecodedToken } from '../auth/guards/supabase-auth/supabase-auth.guard';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectFirebaseAdmin() private readonly firebase: FirebaseAdmin,
    private readonly prisma: PrismaService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<OutputUserDto> {
    if (await this.emailExists({ email: createUserDto.email })) {
      throw new ConflictException('User with this email already exists');
    }

    try {
      this.logger.log(`Create user with email ${createUserDto.email}`);
      const user = await this.prisma.user.create({ data: createUserDto });
      return user;
    } catch (error) {
      this.logger.error(`Error creating user: ${error}`);
      throw new ConflictException('User cannot be created.');
    }
  }

  async invite(inviteUserDto: InviteUserDto): Promise<OutputUserDto> {
    if (await this.emailExists({ email: inviteUserDto.email })) {
      throw new ConflictException('User with this email already exists');
    }
    const user = await this.prisma.user.create({ data: inviteUserDto });
    await this.sendInviteEmail(user);
    return user;
  }

  async checkEmailExists(checkUserExistsDto: CheckUserExistsDto) {
    return {
      exists: await this.emailExists(checkUserExistsDto),
    };
  }

  async emailExists(checkUserExistsDto: CheckUserExistsDto) {
    return !!(await this.prisma.user.findFirst({
      where: { email: checkUserExistsDto.email },
    }));
  }

  async findAll(
    listUsersInput: ListUsersInputDto,
  ): Promise<PaginatedOutputDto<OutputUserDto>> {
    const { roleId, customerId, status, search, perPage, page } =
      listUsersInput;
    this.logger.debug(status);
    this.logger.debug(listUsersInput);
    const where: Prisma.UserFindManyArgs['where'] = {
      ...(roleId && { roleId: { in: roleId } }),
      ...(customerId && { customerId: { in: customerId } }),
      ...(status && { status: { in: status } }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const paginate = createPaginator({ perPage });
    return paginate<OutputUserDto, Prisma.UserFindManyArgs>(
      this.prisma.user,
      { where, orderBy: { id: 'desc' } },
      { page },
    );
  }

  async findOne(
    id: number,
    customerId: number | null = null,
  ): Promise<OutputUserDto> {
    let where = {};
    if (customerId) {
      where = { AND: [{ id }, { customerId }] };
    } else {
      where = { id };
    }

    const user = await this.prisma.user.findFirst({
      where: where,
      include: {
        role: true,
        customer: true,
        manager: true,
      },
    });
    if (!user) {
      throw new NotFoundException('No user with given ID exists');
    }

    return user as OutputUserDto;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<OutputUserDto> {
    if (updateUserDto.email) {
      updateUserDto.email = undefined;
    }
    try {
      const existingUser = await this.prisma.user.findFirst({
        where: { id, customerId: updateUserDto.customerId },
      });

      if (!existingUser) {
        throw new NotFoundException('No user with given ID exists');
      }

      const user = await this.prisma.user.update({
        where: { id, customerId: updateUserDto.customerId },
        data: updateUserDto,
      });
      return user;
    } catch (error) {
      this.logger.error(`Error updating user: ${error}`);
      throw new ConflictException('Error updating user');
    }
  }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }

  async findByUid(uid: string) {
    return this.prisma.user.findUnique({
      where: {
        uid,
      },
    });
  }

  async createFirebaseUser(
    firebaseUser: FirebaseDecodedToken,
    subscriptionId: number | null = null,
  ) {
    const firebaseUserProfile = await this.firebase.auth.getUser(
      firebaseUser.uid,
    );
    console.log('firebaseUserProfile', firebaseUserProfile);

    const existingUser = await this.findByUid(firebaseUser.uid);
    if (existingUser) {
      return existingUser;
    }

    let firstName: string | null = null;
    let lastName: string | null = null;
    if (firebaseUserProfile.displayName) {
      const nameParts = firebaseUserProfile.displayName.split(' ');
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ');
    }

    const email = firebaseUserProfile.email!;
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
      newUser = await this.prisma.user.create({
        data: {
          email: email,
          firstName: firstName,
          lastName: lastName,
          customerId: existingCustomer.id,
          uid: firebaseUser.uid,
        },
      });
    } else {
      newUser = await this.prisma.user.create({
        data: {
          email: email,
          firstName: firstName,
          lastName: lastName,
          uid: firebaseUser.uid,
        },
      });

      existingCustomer = await this.prisma.customer.create({
        data: {
          name: domain,
          email: email,
          domain: domain,
          ownerId: newUser.id,
          subscriptionId: subscriptionId,
        },
      });

      await this.prisma.user.update({
        where: { id: newUser.id },
        data: { customerId: existingCustomer.id },
      });
    }

    await this.sendInviteEmail(newUser);
    return newUser;
  }

  async createSupabaseUser(
    supabaseUser: SupabaseDecodedToken,
    subscriptionId: number | null = null,
  ) {
    const existingUser = await this.findByUid(supabaseUser.uid);
    if (existingUser) return existingUser;

    const [firstName, ...lastNameParts] = supabaseUser.name?.split(' ') || [];
    const lastName = lastNameParts ? lastNameParts.join(' ') : '';
    const email = supabaseUser.email!;
    const domain = getDomainFromEmail(email);

    if (!domain) throw new ConflictException('Invalid email domain');
    if (isPublicEmailDomain(domain))
      throw new ConflictException('Public email domains are not allowed');

    const existingUserEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUserEmail?.uid == null) {
      const existingUserEmailUpdated = await this.prisma.user.update({
        where: { id: existingUserEmail!.id },
        data: { uid: supabaseUser.uid },
      });
      return existingUserEmailUpdated;
    }

    const existingCustomer = await this.prisma.customer.findFirst({
      where: { domain },
    });

    const newUser = await this.prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        avatar: supabaseUser.picture,
        uid: supabaseUser.uid,
        customerId: existingCustomer?.id,
      },
    });

    if (!existingCustomer) {
      const newCustomer = await this.prisma.customer.create({
        data: {
          name: domain,
          email,
          domain,
          ownerId: newUser.id,
          subscriptionId,
        },
      });

      await this.prisma.user.update({
        where: { id: newUser.id },
        data: { customerId: newCustomer.id },
      });
    }

    await this.sendInviteEmail(newUser);
    return newUser;
  }

  async sendInviteEmail(user: OutputUserDto) {
    await this.prisma.userOneTimeCodes.create({
      data: {
        userId: user.id,
        code: this.getRandomString(6),
        isUsed: false,
      },
    });
    // send email
    return true;
  }

  async validateAndVoidOneTimeCode(code: string) {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const existing_code = await this.prisma.userOneTimeCodes.findFirst({
      where: {
        code: code,
        isUsed: false,
        createdAt: {
          gte: yesterday,
          lte: now,
        },
      },
    });
    if (!existing_code) {
      return false;
    }
    existing_code.isUsed = true;
    const id = existing_code.id;
    await this.prisma.userOneTimeCodes.update({
      where: { id },
      data: existing_code,
    });
    await this.prisma.user.update({
      where: { id: existing_code.userId },
      data: {
        emailVerified: true,
        status: CustomerStatus.active,
      },
    });
    return true;
  }

  getRandomString(length: number) {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
