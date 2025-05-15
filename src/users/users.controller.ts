import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Logger,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { InviteMultipleUsersDto } from './dto/invite-multiple-users.dto';
import { CheckUserExistsDto } from './dto/check-user-exists.dto';
import { ApiPaginatedResponse } from '../common/decorators/api-paginated-response.decorator';
import { OutputUserDto } from './dto/output-user.dto';
import { ListUsersInputDto } from './dto/list-users-input.dto';
import { ApiConflictResponse, ApiOkResponse } from '@nestjs/swagger';
import { PaginatedOutputDto } from '../common/dto/paginated-output.dto';
import { Permissions } from '../common/decorators/permissions.decorator';
import { PermissionGuard } from '../auth/guards/permission/permission.guard';
import { User } from '../common/decorators/user.decorator';
import { DynamicAuthGuard } from '../auth/guards/dynamic-auth/dynamic-auth.guard';

@Controller('users')
@UseGuards(DynamicAuthGuard, PermissionGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService) {}

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
    @Body() createUserDto: CreateUserDto,
  ) {
    if (!user.isSuperadmin && !user.customerId) {
      throw new ForbiddenException('You have no access to create users.');
    }
    if (!user.isSuperadmin && user.customerId) {
      // user cannot set another customer when creating users, assign the same he belongs to
      createUserDto.customerId = user.customerId;
    }

    // поки так, спішим до демо
    if (user.isCustomerSuccess && !user.customerId) {
      throw new ForbiddenException('You have no access to create users.');
    } else if (user.isCustomerSuccess && user.customerId) {
      createUserDto.customerId = user.customerId;
    }

    return await this.usersService.create(createUserDto);
  }

  @Post('/invite')
  @ApiOkResponse({
    description: 'The user record',
    type: OutputUserDto,
  })
  @Permissions('UserManagement:inviteUser')
  async invite(
    @User() user: OutputUserDto,
    @Body() inviteUserDto: InviteUserDto,
  ) {
    if (!user.isSuperadmin && !user.customerId) {
      throw new ForbiddenException('You have no access to invite users.');
    }
    if (!user.isSuperadmin && user.customerId) {
      // user cannot set another customer when creating users, assign the same he belongs to
      inviteUserDto.customerId = user.customerId;
    }

    // поки так, спішим до демо
    if (user.isCustomerSuccess && !user.customerId) {
      throw new ForbiddenException('You have no access to create users.');
    } else if (user.isCustomerSuccess && user.customerId) {
      inviteUserDto.customerId = user.customerId;
    }

    return await this.usersService.invite(inviteUserDto);
  }

  @Post('/check-email')
  @ApiOkResponse({
    description: 'Validation result',
    type: Boolean,
  })
  @Permissions('UserManagement:inviteUser')
  async checkEmailExists(@Body() checkEmailDto: CheckUserExistsDto) {
    return await this.usersService.checkEmailExists(checkEmailDto);
  }

  @Post('/invite-multiple')
  @ApiOkResponse({
    description: 'Created users list',
    type: OutputUserDto,
    isArray: true,
  })
  @Permissions('UserManagement:inviteUser')
  async inviteMultiple(
    @User() user: OutputUserDto,
    @Body() inviteUsersDto: InviteMultipleUsersDto,
  ) {
    if (!user.isSuperadmin && !user.customerId) {
      throw new ForbiddenException('You have no access to create users.');
    }
    if (!user.isSuperadmin && user.customerId) {
      // user cannot set another customer when creating users, assign the same he belongs to
      inviteUsersDto.customerId = user.customerId;
    }

    // поки так, спішим до демо
    if (user.isCustomerSuccess && !user.customerId) {
      throw new ForbiddenException('You have no access to create users.');
    } else if (user.isCustomerSuccess && user.customerId) {
      inviteUsersDto.customerId = user.customerId;
    }

    const invitePromises = inviteUsersDto.emails.map(async (email) => {
      if (await this.usersService.emailExists({ email })) {
        this.logger.log(`Invite email already exists: ${email}`);
        return null; // Return null or something to maintain array structure
      } else {
        const inviteUserDto = new InviteUserDto();
        inviteUserDto.email = email;
        inviteUserDto.customerId = inviteUsersDto.customerId;
        inviteUserDto.roleId = inviteUsersDto.roleId;
        inviteUserDto.managerId = inviteUsersDto.managerId;
        return this.usersService.invite(inviteUserDto);
      }
    });

    const results = await Promise.all(invitePromises);
    // Filter out null results as we don’t care about failed/skipped invites. Or care?
    return results.filter((result) => result !== null);
  }

  @Get()
  @ApiPaginatedResponse(OutputUserDto)
  @ApiOkResponse({
    description: 'Created users list',
    type: PaginatedOutputDto,
    isArray: true,
  })
  @Permissions('UserManagement:viewUsers')
  findAll(
    @User() user: OutputUserDto,
    @Query() listUserInputDto: ListUsersInputDto,
  ) {
    this.logger.debug(listUserInputDto);
    if (!user.isSuperadmin && !user.customerId) {
      throw new ForbiddenException('You have no access to list users.');
    }
    if (!user.isSuperadmin && user.customerId) {
      // user cannot set another customer when creating users, assign the same he belongs to
      listUserInputDto.customerId = [user.customerId];
    }

    // поки так, спішим до демо
    if (user.isCustomerSuccess && !user.customerId) {
      throw new ForbiddenException('You have no access to create users.');
    } else if (user.isCustomerSuccess && user.customerId) {
      listUserInputDto.customerId = [user.customerId];
    }

    return this.usersService.findAll(listUserInputDto);
  }

  @Get('/me')
  @ApiOkResponse({
    description: 'User',
    type: OutputUserDto,
  })
  async findSelf(@User() user: OutputUserDto) {
    return await this.usersService.findOne(user.id);
  }

  @Patch('/me')
  @ApiOkResponse({
    description: 'User',
    type: OutputUserDto,
  })
  async updateSelf(
    @User() user: OutputUserDto,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    updateUserDto.customerId = user.customerId!; // do not allow to change customer
    return this.usersService.update(+user.id, updateUserDto);
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'User',
    type: OutputUserDto,
  })
  @Permissions('UserManagement:viewUsers')
  findOne(@User() user: OutputUserDto, @Param('id') id: number) {
    let customerId: number | null = null;
    if (!user.isSuperadmin) {
      customerId = user.customerId;
    }

    // поки так, спішим до демо
    if (user.isCustomerSuccess && !user.customerId) {
      throw new ForbiddenException('You have no access to create users.');
    } else if (user.isCustomerSuccess && user.customerId) {
      customerId = user.customerId;
    }

    return this.usersService.findOne(+id, customerId);
  }

  @Patch(':id')
  @ApiOkResponse({
    description: 'User',
    type: OutputUserDto,
  })
  @Permissions('UserManagement:editUser')
  update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @User() user: OutputUserDto,
  ) {
    if (!user.isSuperadmin && !user.customerId) {
      throw new ForbiddenException('You have no access to update users.');
    }
    if (!user.isSuperadmin && user.customerId) {
      // user cannot set another customer when updating users, assign the same he belongs to
      updateUserDto.customerId = user.customerId;
    }

    // поки так, спішим до демо
    if (user.isCustomerSuccess && !user.customerId) {
      throw new ForbiddenException('You have no access to create users.');
    } else if (user.isCustomerSuccess && user.customerId) {
      updateUserDto.customerId = user.customerId;
    }

    return this.usersService.update(+id, updateUserDto);
  }
}
