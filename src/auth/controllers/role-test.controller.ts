import { Controller, Get, UseGuards } from '@nestjs/common';
import { RoleGuard } from '../guards/role/role.guard';
import { FirebaseAuthGuard } from '../guards/firebase-auth/firebase-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('role-test')
@UseGuards(FirebaseAuthGuard, RoleGuard)
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
