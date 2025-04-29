import { PaginatedInputDto } from '../../common/dto/paginated-input.dto';
import { IsArray, IsEnum, IsInt, IsOptional } from 'class-validator';
import { StatusList } from '../../common/constants/status';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  eachNumberTransformer,
  eachStatusTransformer,
} from '../../common/helpers/class-transform-helpers';

export class ListCustomersInputDto extends PaginatedInputDto {
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({ description: 'Customer IDs' })
  @Transform(eachNumberTransformer)
  id?: number[];

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({ description: 'Subscription ID' })
  @Transform(eachNumberTransformer)
  subscriptionId?: number[];

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({ description: 'Manager IDs' })
  @Transform(eachNumberTransformer)
  managerId?: number[];

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
