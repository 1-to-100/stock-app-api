import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @IsInt()
  @IsOptional()
  @ApiProperty({
    description: 'Customer ID. Only required if superadmin creates a role',
  })
  customerId: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(96)
  @ApiProperty({ description: 'Role name' })
  name: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @ApiProperty({ description: 'Role description' })
  description?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Image URL' })
  imageUrl?: string;
}
