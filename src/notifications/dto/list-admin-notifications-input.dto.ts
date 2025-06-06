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
  NotificationTypes,
} from '@/notifications/constants/notification-types';
import { PaginatedInputDto } from '@/common/dto/paginated-input.dto';

export class ListAdminNotificationsInputDto extends PaginatedInputDto {
  @IsOptional()
  @IsEnum(NotificationTypes)
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

  @IsInt()
  @IsOptional()
  @ApiPropertyOptional({
    description:
      'Customer ID associated with the notification. Only for System Admin or Customer Success',
    required: false,
  })
  customerId?: number;

  @IsInt()
  @IsOptional()
  @ApiPropertyOptional({
    description:
      'User ID associated with the notification. Only for System Admin or Customer Success',
    required: false,
  })
  userId?: number;

  @IsInt()
  @IsOptional()
  @ApiPropertyOptional({
    description:
      'User who generated the notification. Only for System Admin or Customer Success',
    required: false,
  })
  senderId?: number;
}
