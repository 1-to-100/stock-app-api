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
  @ApiPropertyOptional({ description: 'Customer email' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Status' })
  status: string;

  @IsInt()
  @ApiPropertyOptional({ description: 'Subscription ID' })
  subscriptionId: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Subscription name' })
  subscriptionName: string;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({ description: 'Manager Fields' })
  manager: { id: number; name: string } | null = null;

  @IsInt()
  @ApiPropertyOptional({ description: 'Numbers of users' })
  numberOfUsers: number;
}
