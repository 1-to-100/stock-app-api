import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { PaginatedOutputDto } from '@/common/dto/paginated-output.dto';
import { createPaginator } from 'prisma-pagination';
import { CustomerStatus, Prisma } from '@prisma/client';
import {
  getDomainFromEmail,
  isPublicEmailDomain,
} from '@/common/helpers/string-helpers';
import { UserSystemRoles } from '@/common/constants/user-system-roles';
import { supabaseClientAdmin } from '@/common/helpers/supabase-client';
import { FrontendPaths } from '@/common/helpers/frontend-paths';
import { UserStatus } from '@/common/constants/status';
import { OutputUserDto } from '@/users/dto/output-user.dto';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { CreateSystemUserDto } from '@/users/dto/create-system-user.dto';
import { UpdateSystemUserDto } from '@/users/dto/update-system-user.dto';
import { InviteUserDto } from '@/users/dto/invite-user.dto';
import { CheckUserExistsDto } from '@/users/dto/check-user-exists.dto';
import { ListUsersInputDto } from '@/users/dto/list-users-input.dto';
import { UpdateUserDto } from '@/users/dto/update-user.dto';
import { SupabaseDecodedToken } from '@/auth/guards/supabase-auth/supabase-auth.guard';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    createUserDto: CreateUserDto,
    skipInvite: boolean = false,
  ): Promise<OutputUserDto> {
    if (await this.emailExists({ email: createUserDto.email })) {
      throw new ConflictException('User with this email already exists');
    }

    try {
      this.logger.log(`Create user with email ${createUserDto.email}`);
      const user = await this.prisma.user.create({ data: createUserDto });

      if (!skipInvite && user) {
        await this.sendInviteEmail(user);
      }

      return user;
    } catch (error) {
      this.logger.error(`Error creating user: ${error}`);
      throw new ConflictException('User cannot be created.');
    }
  }

  async createSystemUser(
    createSystemUserDto: CreateSystemUserDto,
  ): Promise<OutputUserDto> {
    if (await this.emailExists({ email: createSystemUserDto.email })) {
      throw new ConflictException('User with this email already exists');
    }

    try {
      const { systemRole, ...makeUser } = createSystemUserDto;
      const isSuperadmin = systemRole === UserSystemRoles.SYSTEM_ADMIN;
      const isCustomerSuccess = systemRole === UserSystemRoles.CUSTOMER_SUCCESS;

      if (!(isSuperadmin || isCustomerSuccess)) {
        throw new ConflictException('Invalid system role');
      }

      if (isCustomerSuccess && !createSystemUserDto.customerId) {
        throw new ConflictException(
          'Customer ID is required for Customer Success role',
        );
      } else if (isCustomerSuccess && createSystemUserDto.customerId) {
        const customer = await this.prisma.customer.findUnique({
          where: { id: createSystemUserDto.customerId },
        });
        if (!customer) {
          throw new ConflictException('Customer not found');
        }
      }

      const user = await this.prisma.user.create({
        data: { ...makeUser, isSuperadmin, isCustomerSuccess },
      });

      // attach customer success to customer
      if (isCustomerSuccess && createSystemUserDto.customerId) {
        await this.prisma.customer.update({
          where: { id: createSystemUserDto.customerId },
          data: { customerSuccessId: user.id },
        });
      }

      if (user) {
        await this.sendInviteEmail(user);
      }

      return user;
    } catch (error) {
      this.logger.error(`Error creating user: ${error}`);
      throw new ConflictException('User cannot be created.');
    }
  }

  async updateSystemUser(
    id: number,
    updateSystemUserDto: UpdateSystemUserDto,
  ): Promise<OutputUserDto> {
    if (updateSystemUserDto.email) {
      updateSystemUserDto.email = undefined;
    }
    try {
      const existingUser = await this.findOneSystemUser(id);
      if (!existingUser) {
        throw new NotFoundException('No user with given ID exists');
      }

      const { systemRole, ...updateUser } = updateSystemUserDto;
      const isSuperadmin = systemRole === UserSystemRoles.SYSTEM_ADMIN;
      const isCustomerSuccess = systemRole === UserSystemRoles.CUSTOMER_SUCCESS;

      if (systemRole) {
        if (!(isSuperadmin || isCustomerSuccess)) {
          throw new ConflictException('Invalid system role');
        }

        if (isCustomerSuccess && !updateSystemUserDto.customerId) {
          throw new ConflictException(
            'Customer ID is required for Customer Success role',
          );
        } else if (isCustomerSuccess && updateSystemUserDto.customerId) {
          const customer = await this.prisma.customer.findUnique({
            where: { id: updateSystemUserDto.customerId },
          });
          if (!customer) {
            throw new ConflictException('Customer not found');
          }
        }
      }

      const user = await this.prisma.user.update({
        where: { id },
        data: {
          ...updateUser,
          ...(systemRole ? { isSuperadmin, isCustomerSuccess } : {}),
          ...(isSuperadmin ? { customerId: null } : {}),
        },
      });

      // attach customer success to customer
      if (isSuperadmin) {
        await this.prisma.customer.updateMany({
          where: { customerSuccessId: id },
          data: { customerSuccessId: null },
        });
      } else if (isCustomerSuccess && updateSystemUserDto.customerId) {
        await this.prisma.customer.update({
          where: { id: updateSystemUserDto.customerId },
          data: { customerSuccessId: user.id },
        });
      }

      return user;
    } catch (error) {
      this.logger.error(`Error updating user: ${error}`);
      throw new ConflictException('Error updating user');
    }
  }

  async invite(inviteUserDto: InviteUserDto): Promise<OutputUserDto> {
    if (await this.emailExists({ email: inviteUserDto.email })) {
      throw new ConflictException('User with this email already exists');
    }

    if (inviteUserDto.customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: inviteUserDto.customerId },
      });
      if (!customer) {
        throw new ConflictException('Customer not found');
      }
    }

    const user = await this.prisma.user.create({ data: inviteUserDto });
    await this.sendInviteEmail(user);
    return user;
  }

  async resendInviteEmail(email: string): Promise<OutputUserDto> {
    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    } else if (user.status === UserStatus.ACTIVE) {
      throw new ConflictException('User is already active');
    }

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

  async emailsExists(emails: string[]): Promise<string[]> {
    const existingEmails = await this.prisma.user.findMany({
      select: { email: true },
      where: {
        email: {
          in: emails,
        },
      },
    });

    return existingEmails.map((user) => user.email);
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
      ...{
        AND: [{ isSuperadmin: false }, { isCustomerSuccess: false }],
      },
    };

    const paginate = createPaginator({ perPage });
    return paginate<OutputUserDto, Prisma.UserFindManyArgs>(
      this.prisma.user,
      {
        where,
        orderBy: { id: 'desc' },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      { page },
    );
  }

  async findAllSystemUsers(
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
      ...{ AND: { OR: [{ isSuperadmin: true }, { isCustomerSuccess: true }] } },
    };

    const paginate = createPaginator({ perPage });
    return paginate<OutputUserDto, Prisma.UserFindManyArgs>(
      this.prisma.user,
      {
        where,
        orderBy: { id: 'desc' },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      { page },
    );
  }

  async findOne(
    id: number,
    customerId: number | null = null,
  ): Promise<OutputUserDto> {
    const where = customerId ? { AND: [{ id }, { customerId }] } : { id };
    const user = await this.prisma.user.findFirst({
      where,
      include: {
        // role: {
        //   include: {
        //     permissions: {
        //       include: {
        //         permission: true,
        //       },
        //     },
        //   },
        // },
        role: true,
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        manager: true,
      },
    });

    if (!user) {
      throw new NotFoundException('No user with given ID exists');
    }

    let userPermissions: string[] = [];
    if (user.role) {
      const rolePermissions = await this.prisma.rolePermission.findMany({
        where: { roleId: user.role.id },
        include: {
          permission: true,
        },
      });

      userPermissions = rolePermissions
        ? rolePermissions.map(
            (permission) => permission.permission.name.split(':')[1],
          )
        : [];
    }

    return { ...user, permissions: userPermissions } as OutputUserDto;
  }

  async findOneSystemUser(id: number): Promise<OutputUserDto> {
    const where: Prisma.UserFindManyArgs['where'] = {
      id,
      ...{
        OR: [{ isSuperadmin: true }, { isCustomerSuccess: true }],
      },
    };

    const user = await this.prisma.user.findFirst({
      where: where,
      include: {
        role: true,
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
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

  async createSupabaseUser(
    supabaseUser: SupabaseDecodedToken,
    subscriptionId: number | null = null,
  ) {
    const existingUser = await this.findByUid(supabaseUser.uid);
    if (existingUser) {
      return existingUser;
    }

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

    if (
      existingUserEmail &&
      existingUserEmail.uid == null &&
      supabaseUser.uid
    ) {
      const existingUserEmailUpdated = await this.prisma.user.update({
        where: { id: existingUserEmail.id },
        data: {
          uid: supabaseUser.uid,
          status: UserStatus.ACTIVE,
        },
      });
      return existingUserEmailUpdated;
    }

    const existingCustomer = await this.prisma.customer.findFirst({
      where: { domain },
    });

    const [newUser] = await Promise.all([
      this.prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          avatar: supabaseUser.picture,
          uid: supabaseUser.uid,
          status: supabaseUser.uid ? UserStatus.ACTIVE : UserStatus.INACTIVE,
          customerId: existingCustomer?.id,
        },
      }),
    ]);

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
    const { error } = await supabaseClientAdmin.inviteUserByEmail(user.email, {
      data: {
        ...(user?.firstName && { firstName: user.firstName }),
        ...(user?.lastName && { lastName: user.lastName }),
      },
      redirectTo: FrontendPaths.setNewPassword,
    });

    if (error) {
      this.logger.error(`Error sending invite email: ${error.message}`);
      throw new ConflictException(
        `Error sending invite email: ${error.message}`,
      );
    }

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
