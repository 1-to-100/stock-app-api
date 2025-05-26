import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  constructor(private prisma: PrismaService) {}

  async create(createNotification: CreateNotificationDto) {
    try {
      this.logger.log('Creating notification');
      return this.prisma.notification.create({
        data: createNotification,
      });
    } catch (error) {
      this.logger.error(`Error creating notification: ${error}`);
      throw new ConflictException('Notification cannot be created.');
    }
  }

  async findOne(id: number) {
    this.logger.log(`Finding notification with id ${id}`);
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async findAll() {
    this.logger.log('Finding all notifications');
    return this.prisma.notification.findMany();
  }
}
