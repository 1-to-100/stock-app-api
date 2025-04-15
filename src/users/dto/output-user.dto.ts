import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class OutputUserDto {
  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'First Name' })
  firstName: string;

  @ApiProperty({ description: 'Last Name' })
  lastName: string;

  @ApiProperty({ description: 'ID of the Customer this user belongs to' })
  @IsOptional()
  customerId: number;

  @ApiProperty({ description: 'The role of the user' })
  @IsOptional()
  roleId: number;

  @ApiPropertyOptional({ description: 'Manager ID' })
  @IsOptional()
  managerId: number;

  @ApiPropertyOptional({
    description: 'Status (optional). Default: inactive',
    enum: ['inactive', 'active', 'disabled'],
  })
  @IsOptional()
  status?: string;
}
