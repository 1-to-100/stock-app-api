import { PaginatedInputDto } from '../../common/dto/paginated-input.dto';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { StatusList } from '../../common/constants/status';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListCustomersInputDto extends PaginatedInputDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({ description: 'Customer ID' })
  id?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({ description: 'Subscription ID' })
  subscriptionId?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({ description: 'Manager ID' })
  managerId?: number;

  @IsEnum(StatusList)
  @IsOptional()
  @ApiPropertyOptional({ description: 'Status', enum: StatusList })
  status?: string;
}
