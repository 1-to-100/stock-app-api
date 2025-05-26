import { IsOptional, IsInt, IsBoolean, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateNotificationDto } from './create-notification.dto';

export class NotificationDto extends CreateNotificationDto {
  @IsInt()
  @ApiProperty({ description: 'Notification ID' })
  id: number;

  @IsBoolean()
  @ApiProperty({ description: 'Read status of the notification' })
  isRead: boolean;

  @IsDate()
  @ApiProperty({ description: 'Creation date of the notification' })
  createdAt: Date;

  @IsDate()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Date when the notification was read' })
  readAt?: Date;
}
