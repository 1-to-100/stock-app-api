import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PaginatedOutputDto } from '../common/dto/paginated-output.dto';
import { NotificationDto } from './dto/notification.dto';
import { ListNotificationsInputDto } from './dto/list-notifications-input.dto';
import { createPaginator } from 'prisma-pagination';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  constructor(private prisma: PrismaService) {}

  async create(createNotification: CreateNotificationDto) {
    try {
      this.logger.log('Creating notification');

      if (!createNotification.userId && createNotification.customerId) {
        const users = await this.prisma.user.findMany({
          where: { customerId: createNotification.customerId },
        });

        if (!users.length) {
          throw new ConflictException('No users found for the customer');
        }

        // create notifications for each user
        const notifications = users.map((user) => ({
          ...createNotification,
          userId: user.id,
        }));

        await this.prisma.notification.createMany({
          data: notifications,
        });

        return notifications.at(-1);
      }

      return this.prisma.notification.create({
        data: createNotification,
      });
    } catch (error) {
      this.logger.error(`Error creating notification: ${error}`);
      throw new ConflictException('Notification cannot be created.');
    }
  }

  async findOne(userId: number, id: number) {
    this.logger.log(`Finding notification with id ${id}`);
    const notification = await this.prisma.notification.findUnique({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async findAll(
    userId: number,
    listNotificationsInputDto: ListNotificationsInputDto,
  ): Promise<PaginatedOutputDto<NotificationDto>> {
    this.logger.log('Finding all notifications');
    const { perPage, page } = listNotificationsInputDto;
    const paginate = createPaginator({ perPage });

    const where: Prisma.NotificationFindManyArgs['where'] = {
      userId,
    };

    return paginate<NotificationDto, Prisma.NotificationFindManyArgs>(
      this.prisma.notification,
      {
        where,
        orderBy: { createdAt: 'desc' },
      },
      { page },
    );
  }

  async markAsRead(userId: number, id: number) {
    this.logger.log(`Marking notification with id ${id} as read`);
    const notification = await this.prisma.notification.update({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async markAllAsRead(userId: number) {
    this.logger.log('Marking all notifications as read');
    return this.prisma.notification.updateMany({
      where: { isRead: false, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async marksAsReadMultiple(userId: number, ids: number[]) {
    this.logger.log(`Marking notifications with ids ${ids.join(', ')} as read`);
    return this.prisma.notification.updateMany({
      where: { id: { in: ids }, isRead: false, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async unreadCount(userId: number): Promise<number> {
    this.logger.log(`Counting unread notifications for user ${userId}`);
    return this.prisma.notification.count({
      where: { isRead: false, userId },
    });
  }
}
