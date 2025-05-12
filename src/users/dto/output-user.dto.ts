import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { UserStatusList } from '../../common/constants/status';

export class OutputUserDto {
  @ApiProperty({ description: 'Email address' })
  id: number;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'First Name' })
  firstName: string | null = null;

  @ApiProperty({ description: 'Last Name' })
  lastName: string | null = null;

  @ApiProperty({ description: 'ID of the Customer this user belongs to' })
  @IsOptional()
  customerId: number | null = null;

  @ApiProperty({ description: 'The role of the user' })
  @IsOptional()
  roleId: number | null = null;

  @ApiPropertyOptional({ description: 'Manager ID' })
  @IsOptional()
  managerId: number | null = null;

  @ApiPropertyOptional({
    description: 'Status (optional). Default: inactive',
    enum: UserStatusList,
  })
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Is Superadmin' })
  @IsOptional()
  isSuperadmin?: boolean | null;

  @ApiPropertyOptional({ description: 'Is Customer Success' })
  @IsOptional()
  isCustomerSuccess?: boolean | null;
}
