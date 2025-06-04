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

  @ApiPropertyOptional({
    description: 'User associated with the notification',
    type: 'object',
    properties: {
      id: { type: 'number', description: 'User ID' },
      email: { type: 'string', description: 'User email' },
      firstName: { type: 'string', description: 'User first name' },
      lastName: { type: 'string', description: 'User last name' },
    },
  })
  User?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };

  @ApiPropertyOptional({
    description: 'Customer associated with the notification',
    type: 'object',
    properties: {
      id: { type: 'number', description: 'Customer ID' },
      name: { type: 'string', description: 'Customer name' },
    },
  })
  Customer?: {
    id: number;
    name: string;
  };
}
