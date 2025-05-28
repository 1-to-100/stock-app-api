import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Customer name' })
  @MaxLength(255)
  name: string;

  @IsEmail()
  @ApiProperty({ description: 'Email address' })
  email: string;

  @IsInt()
  @ApiProperty({ description: 'Subscription ID' })
  subscriptionId: number;

  @IsInt()
  @ApiProperty({ description: 'Manager ID' })
  managerId: number | null = null;

  @IsInt()
  @ApiProperty({ description: 'Customer Success ID' })
  customerSuccessId: number | null = null;

  @IsInt()
  @ApiProperty({ description: 'Owner User ID' })
  ownerId: number;
}
