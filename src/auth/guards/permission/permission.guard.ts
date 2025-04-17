import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../../../common/decorators/permissions.decorator';
import { UsersService } from '../../../users/users.service';
import { RolesService } from '../../../roles/roles.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
  ) {}

  canActivateBackup(context: ExecutionContext): boolean | Promise<boolean> {
    console.log('[[[[PERMISSION GUARD]]]]');
    const request = context
      .switchToHttp()
      .getRequest<{ user: { [key: string]: any } }>();

    const user: { [p: string]: any } = request.user;
    console.log(user);

    const allowedPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // if no permissions are required, allow access
    if (!allowedPermissions || allowedPermissions.length === 0) {
      return true;
    }

    const userRole: string | undefined = user.role as string | undefined;
    if (!userRole) {
      throw new ForbiddenException('Access denied: role not found');
    }
    const rolePermissions: Array<string> | undefined = user.permissions as
      | Array<string>
      | undefined;
    if (!rolePermissions) {
      throw new ForbiddenException('Access denied: permissions not found');
    }

    let allowed = false;
    rolePermissions.forEach((permission) => {
      if (allowedPermissions.includes(permission)) {
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

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('[[[[PERMISSION GUARD]]]]');

    const allowedPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // if no permissions are required, allow access
    if (!allowedPermissions || allowedPermissions.length === 0) {
      return true;
    }
    const request = context
      .switchToHttp()
      .getRequest<{ user: { [key: string]: any } }>();

    const requestUser: { [p: string]: any } = request.user;
    console.log(requestUser);
    if (!requestUser) {
      throw new ForbiddenException('Access denied: request user not found');
    }
    if (!requestUser.uid) {
      throw new ForbiddenException(
        'Access denied: request user uid not found, is it from Firebase?',
      );
    }

    const user = await this.usersService.findByUid(requestUser.uid as string);
    console.log(user);
    if (!user) {
      throw new ForbiddenException('Access denied: user not found');
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
