import { IsEmail, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Customer name' })
  name: string;

  @IsEmail({ blacklisted_chars: '\\/%^$#!~*()[]{}<>?|' })
  @ApiProperty({ description: 'Email address' })
  email: string;

  @IsInt()
  @ApiProperty({ description: 'Subscription ID' })
  subscriptionId: number;

  @IsInt()
  @ApiProperty({ description: 'Manager ID' })
  managerId: number | null = null;

  @IsInt()
  @ApiProperty({ description: 'Owner User ID' })
  ownerId: number;
}
