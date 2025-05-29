import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../../../common/decorators/permissions.decorator';
import { RolesService } from '../../../roles/roles.service';
import { DecodedIdToken } from 'firebase-admin/auth';
import { OutputUserDto } from '../../../users/dto/output-user.dto';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rolesService: RolesService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('[[[[PERMISSION GUARD]]]]');

    const allowedPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // if no permissions are required, allow access
    console.log('allowedPermissions', allowedPermissions);
    if (!allowedPermissions || allowedPermissions.length === 0) {
      return true;
    }
    const request = context.switchToHttp().getRequest<{
      user: DecodedIdToken;
      headers: { authorization?: string };
      currentUser: null | OutputUserDto;
    }>();

    const user = request.currentUser;
    if (!user) {
      throw new ForbiddenException('Access denied: user not found');
    }
    if (user.isSuperadmin) {
      return true;
    }

    // треба придумати кращий метод для ролі CustomerSuccess, ніж харкодити деякі доступа
    if (
      user.isCustomerSuccess &&
      allowedPermissions.some(
        (permission) =>
          [
            'UserManagement:viewUsers',
            'UserManagement:createUser',
            'UserManagement:inviteUser',
            'UserManagement:editUser',
          ].includes(permission) || permission.startsWith('Documents:'),
      )
    ) {
      return true;
    }

    const customer = await this.prisma.customer.findFirst({
      where: {
        id: user.customerId!,
      },
    });
    console.log('======================');
    console.log(customer);
    console.log(user);
    console.log('======================');
    // allow customer owner to access its endpoints
    if (customer && user.id == customer.ownerId) {
      return true;
    }
    if (!user.roleId) {
      throw new ForbiddenException('Access denied: user has no role assigned');
    }

    const userRole = await this.rolesService.findOne(user.roleId);
    if (!userRole) {
      throw new ForbiddenException('Access denied: role not found');
    }
    const rolePermissions = userRole.permissions;
    if (!rolePermissions) {
      throw new ForbiddenException('Access denied: permissions not found');
    }

    let allowed = false;
    rolePermissions.forEach((permission) => {
      if (allowedPermissions.includes(permission.permission.name)) {
        allowed = true;
      }
    });

    if (!allowed) {
      throw new ForbiddenException(
        `Access denied: required permission(s): ${allowedPermissions.join(', ')}`,
      );
    }

    console.log('user', user);
    return true;
  }
}
