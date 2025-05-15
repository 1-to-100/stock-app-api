import { IsIn, IsNotEmpty } from 'class-validator';
import { UserSystemRolesList } from '../../common/constants/user-system-roles';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSystemUserDto extends CreateUserDto {
  @ApiProperty({ description: 'User System Role' })
  @IsNotEmpty()
  @IsIn(UserSystemRolesList)
  systemRole: string;
}
