import { PaginatedInputDto } from '../../common/dto/paginated-input.dto';
import { IsArray, IsEnum, IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  NotificationType,
  NotificationTypes,
} from '../constants/notification-types';
import { NotificationChannel } from '../constants/notification-channel';
import { Transform } from 'class-transformer';
import {
  eachNotificationChannelTransformer,
  eachNotificationTypeTransformer,
} from '../helpers/class-transform-helpers';

export class ListTemplatesInputDto extends PaginatedInputDto {
  @IsOptional()
  @IsInt()
  @ApiProperty({
    description: 'Customer ID associated with the notification template',
    required: false,
  })
  customerId?: number;

  @IsOptional()
  @IsArray()
  @IsEnum(NotificationTypes, { each: true })
  @ApiProperty({
    description: 'Types of the notification',
    enum: NotificationTypes,
    isArray: true,
    default: [],
    required: false,
    example: [NotificationTypes.EMAIL, NotificationTypes.IN_APP],
  })
  @Transform(eachNotificationTypeTransformer)
  type?: NotificationType[];

  @IsOptional()
  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  @ApiProperty({
    description: 'Notification channels',
    enum: NotificationChannel,
    isArray: true,
    required: false,
    example: [NotificationChannel.article, NotificationChannel.info],
  })
  @Transform(eachNotificationChannelTransformer)
  channel?: string[];
}
