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
  // Delete,
  // Query,
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
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth/firebase-auth.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { PermissionGuard } from '../auth/guards/permission/permission.guard';

@Controller('users')
@UseGuards(FirebaseAuthGuard, PermissionGuard)
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
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Post('/invite')
  @ApiOkResponse({
    description: 'The user record',
    type: OutputUserDto,
  })
  @Permissions('UserManagement:inviteUser')
  async invite(@Body() inviteUserDto: InviteUserDto) {
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
  async inviteMultiple(@Body() inviteUsersDto: InviteMultipleUsersDto) {
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

  @Get('/validate-code/:code')
  async validateCode(@Param('code') code: string) {
    if (await this.usersService.validateAndVoidOneTimeCode(code)) {
      return { exists: true, message: 'code validated and voided' };
    }
    return { exists: false, message: 'code is not valid' };
  }

  @Get()
  @ApiPaginatedResponse(OutputUserDto)
  @ApiOkResponse({
    description: 'Created users list',
    type: PaginatedOutputDto,
    isArray: true,
  })
  @Permissions('UserManagement:viewUsers')
  findAll(@Query() listUserInputDto: ListUsersInputDto) {
    return this.usersService.findAll(listUserInputDto);
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'User',
    type: OutputUserDto,
  })
  @Permissions('UserManagement:viewUsers')
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @ApiOkResponse({
    description: 'User',
    type: OutputUserDto,
  })
  @Permissions('UserManagement:editUser')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }
  //
  // @Delete(':id')
  // remove(@Param('id') id: number) {
  //   return this.usersService.remove(+id);
  // }
}
