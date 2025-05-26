import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [PrismaService, NotificationsService],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
