import { PaginatedInputDto } from '../../common/dto/paginated-input.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ListCustomersOutputDto extends PaginatedInputDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Name' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Status' })
  status: string;

  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({ description: 'Customer email' })
  email: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Customer name' })
  firstName: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Customer last name' })
  lastName: string;

  @IsInt()
  @ApiPropertyOptional({ description: 'Subscription ID' })
  subscriptionId: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Subscription name' })
  subscriptionName: string;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({ description: 'Manager ID' })
  managerId: number | null;
}
