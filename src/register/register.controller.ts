import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { RegisterService } from './register.service';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';

@Controller('register')
export class RegisterController {
  constructor(
    private readonly registerService: RegisterService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  create(@Body() registerDto: RegisterDto) {
    return this.registerService.register(registerDto);
  }

  @Get('/validate-code/:code')
  async validateCode(@Param('code') code: string) {
    if (await this.usersService.validateAndVoidOneTimeCode(code)) {
      return { exists: true, message: 'code validated and voided' };
    }
    return { exists: false, message: 'code is not valid' };
  }
}
