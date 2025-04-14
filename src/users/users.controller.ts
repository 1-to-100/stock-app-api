import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Logger,
  // Delete,
  // Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { InviteMultipleUsersDto } from './dto/invite-multiple-users.dto';
import { CheckUserExistsDto } from './dto/check-user-exists.dto';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Post('/invite')
  async invite(@Body() inviteUserDto: InviteUserDto) {
    return await this.usersService.invite(inviteUserDto);
  }

  @Post('/check-email')
  async checkEmailExists(@Body() checkEmailDto: CheckUserExistsDto) {
    return await this.usersService.checkEmailExists(checkEmailDto);
  }

  @Post('/invite-multiple')
  async inviteMultiple(@Body() inviteUsersDto: InviteMultipleUsersDto) {
    const invitePromises = inviteUsersDto.emails.map((email) => {
      if (!this.usersService.emailExists({ email: email })) {
        const inviteUserDto = new InviteUserDto();
        inviteUserDto.email = email;
        inviteUserDto.customerId = inviteUsersDto.customerId;
        inviteUserDto.roleId = inviteUsersDto.roleId;
        inviteUserDto.managerId = inviteUsersDto.managerId;
        return this.usersService.invite(inviteUserDto);
      } else {
        this.logger.log(`Invite email already exists ` + email);
      }
    });

    return await Promise.all(invitePromises);
  }

  @Get('/validate-code/:code')
  async validateCode(@Param('code') code: string) {
    if (await this.usersService.validateAndVoidOneTimeCode(code)) {
      return { exists: true, message: 'code validated and voided' };
    }
    return { exists: false, message: 'code is not valid' };
  }

  @Get()
  findAll() {
    return this.usersService.findAll({});
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }
  //
  // @Delete(':id')
  // remove(@Param('id') id: number) {
  //   return this.usersService.remove(+id);
  // }
}
