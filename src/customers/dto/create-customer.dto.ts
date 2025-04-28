import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Customer name' })
  name: string;

  @IsEmail()
  @ApiProperty({ description: 'Email address' })
  email: string;

  @IsInt()
  @ApiPropertyOptional({ description: 'Subscription ID' })
  subscriptionId: number;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({ description: 'Manager ID' })
  managerId: number | null = null;
}
