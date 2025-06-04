import { Global, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PrismaService } from '../prisma/prisma.service';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';

@Global()
@Module({
  providers: [PrismaService, NotificationsService, TemplatesService],
  controllers: [NotificationsController, TemplatesController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
