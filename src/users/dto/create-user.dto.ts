import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'First Name' })
  firstName: string;
  @ApiProperty({ description: 'Last Name' })
  lastName: string;

  @IsInt()
  customerId: number;

  @IsInt()
  roleId: number;

  managerId: number;
  status: string;
}
