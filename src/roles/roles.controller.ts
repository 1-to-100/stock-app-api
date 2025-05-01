import {
  ConflictException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateRolePermissionsByNameDto } from './dto/update-role-permissions-by-name.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OutputRoleDto } from './dto/output-role.dto';
import { CustomerId } from '../common/decorators/customer-id.decorator';
import { User } from '../common/decorators/user.decorator';
import { OutputUserDto } from '../users/dto/output-user.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth/firebase-auth.guard';
import { PermissionGuard } from '../auth/guards/permission/permission.guard';

@Controller('roles')
@UseGuards(FirebaseAuthGuard, PermissionGuard)
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  create(
    @User() user: OutputUserDto,
    @CustomerId() customerId: string | null,
    @Body() createRoleDto: CreateRoleDto,
  ) {
    if (user.isSuperadmin) {
      if (!customerId) {
        throw new ConflictException(
          'To create role, you have to pass customerId',
        );
      } else {
        createRoleDto.customerId = parseInt(customerId, 10);
      }
    } else {
      if (user.customerId === null) {
        throw new ConflictException(
          'User must have a customerId to create a role',
        );
      }
      createRoleDto.customerId = user.customerId;
    }
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  findAll(
    @CustomerId() customerId: string | null,
    @User() user: OutputUserDto,
  ) {
    let customerIdNum: number = 0;
    if (!user.isSuperadmin) {
      customerIdNum = user.customerId ?? 0;
    } else if (customerId) {
      customerIdNum = parseInt(customerId, 10);
    }
    return this.rolesService.findAll({ where: { customerId: customerIdNum } });
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @User() user: OutputUserDto,
    @CustomerId() customerId: string | null,
  ): Promise<OutputRoleDto> {
    let customerIdNum: number = 0;
    if (!user.isSuperadmin) {
      customerIdNum = user.customerId ?? 0;
    } else if (customerId) {
      customerIdNum = parseInt(customerId, 10);
    }
    const role = await this.rolesService.findOne(+id, customerIdNum);
    const outputRole = {
      id: role.id,
      name: role.name,
      description: role.description,
      imageUrl: role.imageUlrl,
      permissions: {},
    };

    const rolePermissions = role.permissions;

    outputRole.permissions = rolePermissions.reduce<
      Record<string, Array<{ id: number; name: string; label: string }>>
    >((acc, permission) => {
      const prefix = permission.permission.name.split(':')[0];

      if (!acc[prefix]) {
        acc[prefix] = [];
      }

      acc[prefix].push({
        id: permission.permissionId,
        name: permission.permission.name,
        label: permission.permission.label,
      });

      return acc;
    }, {});

    return outputRole;
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @User() user: OutputUserDto,
    @CustomerId() customerId: string | null,
  ) {
    let customerIdNum: number = 0;
    if (!user.isSuperadmin) {
      customerIdNum = user.customerId ?? 0;
    } else if (customerId) {
      customerIdNum = parseInt(customerId, 10);
    }
    if (customerIdNum == 0) {
      throw new ConflictException(
        'customerId cannot be determined to update a role',
      );
    }
    updateRoleDto.customerId = customerIdNum;
    return this.rolesService.update(+id, updateRoleDto);
  }

  //
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.rolesService.remove(+id);
  // }

  @Post(':id/permissions')
  updatePermissionsByName(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRolePermissionsByNameDto,
    @User() user: OutputUserDto,
    @CustomerId() customerId: string | null,
  ) {
    let customerIdNum: number = 0;
    if (!user.isSuperadmin) {
      customerIdNum = user.customerId ?? 0;
    } else if (customerId) {
      customerIdNum = parseInt(customerId, 10);
    }
    return this.rolesService.updateRolePermissionsByName(
      id,
      dto,
      customerIdNum,
    );
  }
}
