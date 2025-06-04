import { PaginatedInputDto } from '../../common/dto/paginated-input.dto';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import {
  NotificationTypes,
  NotificationTypeList,
  NotificationType,
} from '../constants/notification-types';

export class ListNotificationsInputDto extends OmitType(PaginatedInputDto, [
  'search',
] as const) {
  @IsOptional()
  @IsEnum(NotificationTypeList)
  @ApiProperty({
    description: 'Type of the notification',
    enum: NotificationTypes,
    required: false,
  })
  type?: NotificationType;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Read status of the notification',
    required: false,
  })
  isRead?: boolean;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Notification channel',
    required: false,
  })
  channel?: string;
}
