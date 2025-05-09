import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail(
    { blacklisted_chars: '\\/%^$#!~*()[]{}<>?|' },
    { message: 'Invalid email format' },
  )
  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'First Name', example: 'John' })
  @IsString()
  @MinLength(1)
  firstName: string;

  @ApiProperty({ description: 'Last Name', example: 'Doe' })
  @IsString()
  @MinLength(1)
  lastName: string;

  @ApiProperty({ description: 'ID of the Customer this user belongs to' })
  @IsOptional()
  @IsInt()
  customerId?: number;

  @ApiProperty({ description: 'The role of the user' })
  @IsOptional()
  @IsInt()
  roleId?: number;

  @ApiPropertyOptional({ description: 'Manager ID' })
  @IsOptional()
  @IsInt()
  managerId?: number;

  @ApiPropertyOptional({
    description: 'Status (optional). Default: inactive',
    enum: ['inactive', 'active', 'disabled'],
  })
  @IsOptional()
  @IsIn(['inactive', 'active', 'disabled'])
  status?: string;
}
