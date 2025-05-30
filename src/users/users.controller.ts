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
  BadRequestException,
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
import { CustomerId } from '../common/decorators/customer-id.decorator';
import { ResendInviteUserDto } from './dto/resend-invite-user.dto';

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

    return await this.usersService.invite(inviteUserDto);
  }

  @Post('/resend-invite')
  @ApiOkResponse({
    description: 'The user record',
    type: OutputUserDto,
  })
  @Permissions('UserManagement:inviteUser')
  async resendInvite(
    @User() user: OutputUserDto,
    @Body() resendInviteUserDto: ResendInviteUserDto,
  ) {
    if (!user.isSuperadmin && !user.customerId) {
      throw new ForbiddenException('You have no access to resend invites.');
    }

    return this.usersService.resendInviteEmail(resendInviteUserDto.email);
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

    // found duplicate emails
    const seenEmails = new Set<string>();
    const duplicateEmails = inviteUsersDto.emails.filter((email) => {
      if (seenEmails.has(email)) return true;
      seenEmails.add(email);
      return false;
    });

    if (duplicateEmails.length > 0) {
      throw new BadRequestException(
        `Duplicate emails found: ${duplicateEmails.join(', ')}`,
      );
    }

    const existingEmails = await this.usersService.emailsExists(
      inviteUsersDto.emails,
    );

    if (existingEmails.length > 0) {
      throw new BadRequestException(
        `The following emails already exist: ${existingEmails.join(', ')}`,
      );
    }

    const invitePromises = inviteUsersDto.emails.map(async (email) => {
      const inviteUserDto = new InviteUserDto();
      inviteUserDto.email = email;
      inviteUserDto.customerId = inviteUsersDto.customerId;
      inviteUserDto.roleId = inviteUsersDto.roleId;
      inviteUserDto.managerId = inviteUsersDto.managerId;
      return this.usersService.invite(inviteUserDto);
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
    @CustomerId() customerId?: string,
  ) {
    this.logger.debug(listUserInputDto);
    if (!user.isSuperadmin && !user.customerId) {
      throw new ForbiddenException('You have no access to list users.');
    }
    if (!user.isSuperadmin && user.customerId) {
      // user cannot set another customer when creating users, assign the same he belongs to
      listUserInputDto.customerId = [user.customerId];
    }

    if (customerId) {
      listUserInputDto.customerId = [+customerId];
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

    return this.usersService.update(+id, updateUserDto);
  }
}
