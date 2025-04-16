import { IsArray, IsString } from 'class-validator';

export class UpdateRolePermissionsByNameDto {
  @IsArray()
  @IsString({ each: true })
  permissionNames: string[];
}
