import { PaginatedInputDto } from '../../common/dto/paginated-input.dto';
import { IsArray, IsEnum, IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { StatusList } from '../../common/constants/status';
import {
  eachNumberTransformer,
  eachStatusTransformer,
} from '../../common/helpers/class-transform-helpers';

export class ListUsersInputDto extends PaginatedInputDto {
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({ description: 'Role IDs', type: [Number] })
  @Transform(eachNumberTransformer)
  roleId?: number[];

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({ description: 'Customer IDs', type: [Number] })
  @Transform(eachNumberTransformer)
  customerId?: number[];

  @IsArray()
  @IsEnum(StatusList, { each: true })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Statuses',
    enum: StatusList,
    isArray: true,
  })
  @Transform(eachStatusTransformer)
  status?: string[];
}
