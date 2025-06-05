import { IsOptional, IsInt, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateTemplateDto } from '@/notifications/dto/create-template.dto';

export class NotificationTemplateDto extends CreateTemplateDto {
  @IsInt()
  @ApiProperty({ description: 'Notification template ID' })
  id: number;

  @IsInt()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Customer ID associated with the notification',
  })
  customerId?: number;

  @IsDate()
  @ApiProperty({ description: 'Creation date of the notification template' })
  createdAt: Date;
}
