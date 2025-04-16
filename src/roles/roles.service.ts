import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UpdateRolePermissionsByNameDto } from './dto/update-role-permissions-by-name.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    if (
      await this.prisma.role.findFirst({
        where: { name: createRoleDto.name },
      })
    ) {
      throw new ConflictException('Role with name already exists');
    }
    return this.prisma.role.create({ data: createRoleDto });
  }

  findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.RoleWhereUniqueInput;
    where?: Prisma.RoleWhereInput;
    orderBy?: Prisma.RoleOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: { users: true },
        },
      },
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async findOne(id: number) {
    const role = await this.prisma.role.findFirst({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
    if (!role) {
      throw new NotFoundException('No role with given ID exists');
    }
    return role;
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
    });
  }

  // remove(id: number) {
  //   return `This action removes a #${id} role`;
  // }

  async updateRolePermissionsByName(
    roleId: number,
    dto: UpdateRolePermissionsByNameDto,
  ) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    const permissions = await this.prisma.permission.findMany({
      where: {
        name: {
          in: dto.permissionNames,
        },
      },
    });

    if (permissions.length !== dto.permissionNames.length) {
      const foundNames = permissions.map((p) => p.name);
      const missing = dto.permissionNames.filter(
        (name) => !foundNames.includes(name),
      );
      throw new BadRequestException(
        `Invalid permission names: ${missing.join(', ')}`,
      );
    }

    // clear existing permissions
    await this.prisma.rolePermission.deleteMany({ where: { roleId } });

    // add new permissions
    await this.prisma.rolePermission.createMany({
      data: permissions.map((p) => ({
        roleId,
        permissionId: p.id,
      })),
      skipDuplicates: true,
    });

    return {
      message: `Permissions updated for role ID ${roleId}`,
      count: permissions.length,
    };
  }
}
