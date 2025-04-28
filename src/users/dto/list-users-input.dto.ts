import { PaginatedInputDto } from '../../common/dto/paginated-input.dto';
import { IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ListUsersInputDto extends PaginatedInputDto {
  @ApiPropertyOptional({ description: 'Role ID' })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  roleId?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({ description: 'Customer ID' })
  customerId?: number;
}
