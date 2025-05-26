import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import {
  NotificationType,
  NotificationTypeList,
} from '../constants/notification-type';

export class CreateNotificationDto {
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

  @IsEnum(NotificationTypeList)
  @ApiProperty({
    description: 'Type of the notification',
    enum: NotificationType,
  })
  type: NotificationType;

  @IsString()
  @ApiProperty({ description: 'Message content of the notification' })
  message: string;

  @IsOptional()
  @ApiPropertyOptional({ description: 'Metadata in JSON format' })
  metadata?: Record<string, any>;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Notification channel',
  })
  channel?: string;
}
