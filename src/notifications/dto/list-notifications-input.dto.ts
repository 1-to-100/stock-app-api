import { PaginatedInputDto } from '../../common/dto/paginated-input.dto';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import {
  NotificationType,
  NotificationTypeList,
} from '../constants/notification-type';

export class ListNotificationsInputDto extends OmitType(PaginatedInputDto, [
  'search',
] as const) {
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
