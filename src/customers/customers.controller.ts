import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ListCustomersInputDto } from './dto/list-customers-input.dto';
import { User } from '../common/decorators/user.decorator';
import { OutputUserDto } from '../users/dto/output-user.dto';
import { DynamicAuthGuard } from '../auth/guards/dynamic-auth/dynamic-auth.guard';

@Controller('customers')
@UseGuards(DynamicAuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(
    @User() user: OutputUserDto,
    @Body() createCustomerDto: CreateCustomerDto,
  ) {
    if (!user.isSuperadmin) {
      throw new ForbiddenException('You have no access to customers.');
    }
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  findAll(
    @Query() listCustomersInputDto: ListCustomersInputDto,
    @User() user: OutputUserDto,
  ) {
    if (!user.isSuperadmin) {
      throw new ForbiddenException('You have no access to customers.');
    }
    return this.customersService.findAll(listCustomersInputDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @User() user: OutputUserDto) {
    if (!user.isSuperadmin) {
      throw new ForbiddenException('You have no access to customers.');
    }
    return this.customersService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @User() user: OutputUserDto,
  ) {
    if (!user.isSuperadmin) {
      throw new ForbiddenException('You have no access to customers.');
    }
    return this.customersService.update(+id, updateCustomerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: OutputUserDto) {
    if (!user.isSuperadmin) {
      throw new ForbiddenException('You have no access to customers.');
    }
    return this.customersService.remove(+id);
  }
}
