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
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectFirebaseAdmin() private readonly firebase: FirebaseAdmin,
    private readonly prisma: PrismaService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<OutputUserDto> {
    if (await this.emailExists({ email: createUserDto.email })) {
      throw new ConflictException('User already exists');
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
      throw new ConflictException('User already exists');
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
    const where: Prisma.UserFindManyArgs['where'] = {};

    if (listUsersInput.roleId !== undefined) {
      where.roleId = listUsersInput.roleId;
    }

    const paginate = createPaginator({ perPage: listUsersInput.perPage });
    return paginate<OutputUserDto, Prisma.UserFindManyArgs>(
      this.prisma.user,
      {
        where,
        orderBy: {
          id: 'desc',
        },
      },
      {
        page: listUsersInput.page,
      },
    );
  }

  async findOne(id: number): Promise<OutputUserDto> {
    const user = await this.prisma.user.findFirst({ where: { id } });
    if (!user) {
      throw new NotFoundException('No user with given ID exists');
    }
    return user;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<OutputUserDto> {
    if (updateUserDto.email) {
      updateUserDto.email = undefined;
    }
    try {
      // it should be separate assignment, otherwise the catch is not working
      const user = await this.prisma.user.update({
        where: { id },
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

  findByUid(uid: string) {
    return this.prisma.user.findUnique({
      where: {
        uid,
      },
    });
  }

  async createFirebaseUser(firebaseUser: FirebaseDecodedToken) {
    const firebaseUserProfile = await this.firebase.auth.getUser(
      firebaseUser.uid,
    );
    console.log('firebaseUserProfile', firebaseUserProfile);

    const existingUser = await this.findByUid(firebaseUser.uid);
    if (existingUser) {
      return existingUser;
    } else {
      let firstName: string | null = null;
      let lastName: string | null = null;
      if (firebaseUserProfile.displayName) {
        const nameParts = firebaseUserProfile.displayName.split(' ');
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
      }
      return this.prisma.user.create({
        data: {
          uid: firebaseUserProfile.uid,
          email: firebaseUserProfile.email!,
          emailVerified: Boolean(firebaseUser.email_verified),
          firstName,
          lastName,
        },
      });
    }
  }

  async sendInviteEmail(user: User) {
    await this.prisma.userOneTimeCodes.create({
      data: {
        userId: user.id,
        code: this.getRandomString(16),
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
