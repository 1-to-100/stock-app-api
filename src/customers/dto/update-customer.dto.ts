import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateCustomerDto } from './create-customer.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { UserStatusList, UserStatusType } from '../../common/constants/status';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  @IsEnum(UserStatusList)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Status (optional). Default: inactive',
    enum: UserStatusList,
  })
  status?: UserStatusType;
}
