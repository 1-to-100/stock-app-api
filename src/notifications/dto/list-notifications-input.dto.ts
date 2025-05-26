import { PaginatedInputDto } from '../../common/dto/paginated-input.dto';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  NotificationType,
  NotificationTypeList,
} from '../constants/notification-type';

export class ListNotificationsInputDto extends PaginatedInputDto {
  @IsInt()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'User ID associated with the notification',
  })
  userId?: number;

  @IsInt()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Customer ID associated with the notification',
  })
  customerId?: number;

  @IsOptional()
  @IsEnum(NotificationTypeList)
  @ApiProperty({
    description: 'Type of the notification',
    enum: NotificationType,
  })
  type: NotificationType;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ description: 'Read status of the notification' })
  isRead: boolean;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Notification channel',
  })
  channel?: string;
}
