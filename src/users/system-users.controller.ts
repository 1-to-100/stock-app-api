import {
  Controller,
  Get,
  Param,
  Logger,
  Query,
  UseGuards,
  ForbiddenException,
  Post,
  Body,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiPaginatedResponse } from '../common/decorators/api-paginated-response.decorator';
import { OutputUserDto } from './dto/output-user.dto';
import { ListUsersInputDto } from './dto/list-users-input.dto';
import { ApiConflictResponse, ApiOkResponse } from '@nestjs/swagger';
import { PaginatedOutputDto } from '../common/dto/paginated-output.dto';
import { PermissionGuard } from '../auth/guards/permission/permission.guard';
import { User } from '../common/decorators/user.decorator';
import { DynamicAuthGuard } from '../auth/guards/dynamic-auth/dynamic-auth.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CreateSystemUserDto } from './dto/create-system-user.dto';
import { UpdateSystemUserDto } from './dto/update-system-user.dto';

@Controller('system-users')
@UseGuards(DynamicAuthGuard, PermissionGuard)
export class SystemUsersController {
  private readonly logger = new Logger(SystemUsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiPaginatedResponse(OutputUserDto)
  @ApiOkResponse({
    description: 'Created users list',
    type: PaginatedOutputDto,
    isArray: true,
  })
  findAll(
    @User() user: OutputUserDto,
    @Query() listUserInputDto: ListUsersInputDto,
  ) {
    this.logger.debug(listUserInputDto);
    if (!user.isSuperadmin) {
      throw new ForbiddenException('You have no access to list users.');
    }

    return this.usersService.findAllSystemUsers(listUserInputDto);
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'User',
    type: OutputUserDto,
  })
  findOne(@User() user: OutputUserDto, @Param('id') id: number) {
    if (!user.isSuperadmin) {
      throw new ForbiddenException('You have no access to user.');
    }
    return this.usersService.findOneSystemUser(+id);
  }

  @Post()
  @ApiOkResponse({
    description: 'The user record',
    type: OutputUserDto,
  })
  @ApiConflictResponse({
    description: 'Error creating user with provided data',
  })
  @Permissions('UserManagement:createUser')
  async create(
    @User() user: OutputUserDto,
    @Body() createSystemUserDto: CreateSystemUserDto,
  ) {
    if (!user.isSuperadmin) {
      throw new ForbiddenException('You have no access to create users.');
    }

    return await this.usersService.createSystemUser(createSystemUserDto);
  }

  @Patch(':id')
  @ApiOkResponse({
    description: 'User',
    type: OutputUserDto,
  })
  update(
    @Param('id') id: number,
    @Body() updateSystemUserDto: UpdateSystemUserDto,
    @User() user: OutputUserDto,
  ) {
    if (!user.isSuperadmin) {
      throw new ForbiddenException('You have no access to create users.');
    }

    return this.usersService.updateSystemUser(+id, updateSystemUserDto);
  }
}
