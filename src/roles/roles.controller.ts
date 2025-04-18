import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateRolePermissionsByNameDto } from './dto/update-role-permissions-by-name.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OutputRoleDto } from './dto/output-role.dto';

@Controller('roles')
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  findAll() {
    return this.rolesService.findAll({});
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<OutputRoleDto> {
    const role = await this.rolesService.findOne(+id);
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
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
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
  ) {
    return this.rolesService.updateRolePermissionsByName(id, dto);
  }
}
