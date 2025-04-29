import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateCustomerDto } from './create-customer.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { StatusList, StatusType } from '../../common/constants/status';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  @IsEnum(StatusList)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Status (optional). Default: inactive',
    enum: StatusList,
  })
  status?: StatusType;
}
