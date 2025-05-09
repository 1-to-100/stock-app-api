import { Controller, Get, UseGuards } from '@nestjs/common';
import { RoleGuard } from '../guards/role/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { DynamicAuthGuard } from '../guards/dynamic-auth/dynamic-auth.guard';

@Controller('role-test')
@UseGuards(DynamicAuthGuard, RoleGuard)
export class RoleTestController {
  @Get('admin')
  @Roles('admin')
  admin() {
    return {
      message: 'ok',
      role: 'admin',
    };
  }

  @Get('manager')
  @Roles('admin', 'manager')
  manager() {
    return {
      message: 'ok',
      role: 'admin or manager',
    };
  }
}
