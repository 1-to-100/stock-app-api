import { Global, Module } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { NotificationsService } from '@/notifications/notifications.service';
import { TemplatesService } from '@/notifications/templates.service';
import { NotificationsController } from '@/notifications/notifications.controller';
import { TemplatesController } from '@/notifications/templates.controller';

@Global()
@Module({
  providers: [PrismaService, NotificationsService, TemplatesService],
  controllers: [NotificationsController, TemplatesController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
