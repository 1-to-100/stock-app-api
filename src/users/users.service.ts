import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { FirebaseDecodedToken } from '../common/types/forebase-decoded-token.type';
import { FirebaseAdmin, InjectFirebaseAdmin } from 'nestjs-firebase';

@Injectable()
export class UsersService {
  constructor(
    @InjectFirebaseAdmin() private readonly firebase: FirebaseAdmin,
    private prisma: PrismaService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    if (
      await this.prisma.user.findFirst({
        where: { email: createUserDto.email },
      })
    ) {
      throw new ConflictException('User already exists');
    }
    return this.prisma.user.create({ data: createUserDto });
  }

  findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  findOne(id: number) {
    return this.prisma.user.findUniqueOrThrow({ where: { id } });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.email) {
      updateUserDto.email = undefined;
    }
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

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
}
