import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
  ForbiddenException,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ApiBody, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import { DynamicAuthGuard } from '../auth/guards/dynamic-auth/dynamic-auth.guard';
import { User } from '../common/decorators/user.decorator';
import { OutputUserDto } from '../users/dto/output-user.dto';
import { NotificationDto } from './dto/notification.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ApiPaginatedResponse } from '../common/decorators/api-paginated-response.decorator';
import { ListNotificationsInputDto } from './dto/list-notifications-input.dto';
import { PaginatedOutputDto } from '../common/dto/paginated-output.dto';

@Controller('notifications')
@UseGuards(DynamicAuthGuard)
export class NotificationsController {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // Only superadmins can create notifications
  @Post()
  @ApiOkResponse({
    description: 'Notification created successfully',
    type: NotificationDto,
  })
  async createNotification(
    @User() user: OutputUserDto,
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    if (!user.isSuperadmin) {
      throw new ForbiddenException(
        'User is not authorized to create notifications',
      );
    }

    const { userId, customerId } = createNotificationDto;

    if (!userId && !customerId) {
      throw new BadRequestException(
        'Notification must be associated with a user or customer',
      );
    }

    if (customerId) {
      const foundCustomer = await this.prismaService.customer.findUnique({
        where: { id: customerId },
      });

      if (!foundCustomer) {
        throw new BadRequestException('Customer not found');
      }
    }

    if (userId) {
      const foundUser = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!foundUser || foundUser.customerId !== customerId) {
        throw new BadRequestException('User not linked to the customer');
      }
    }

    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @ApiPaginatedResponse(NotificationDto)
  @ApiOkResponse({
    description: 'The notifications list',
    type: PaginatedOutputDto,
    isArray: true,
  })
  async findAllNotifications(
    @User() user: OutputUserDto,
    @Query() listNotificationsInputDto: ListNotificationsInputDto,
  ) {
    return this.notificationsService.findAll(
      +user.id,
      listNotificationsInputDto,
    );
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'The notification record',
    type: NotificationDto,
  })
  @ApiParam({ name: 'id', type: Number })
  async findOneNotification(
    @User() user: OutputUserDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.notificationsService.findOne(+user.id, +id);
  }

  @Patch('/read-all')
  @ApiOkResponse({
    description: 'Mark all notifications as read',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'All notifications marked as read',
        },
      },
    },
  })
  async markAllAsRead(@User() user: OutputUserDto) {
    await this.notificationsService.markAllAsRead(+user.id);
    return { message: 'All notifications marked as read' };
  }

  @Patch(':id')
  @ApiOkResponse({
    description: 'Mark notification as read',
    type: NotificationDto,
  })
  @ApiParam({ name: 'id', type: Number })
  async markAsRead(
    @User() user: OutputUserDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.notificationsService.markAsRead(+user.id, +id);
  }

  @Patch()
  @ApiBody({
    description: 'Array of notification IDs to mark as read',
    schema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          items: {
            type: 'number',
          },
          example: [1, 2, 3],
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Multiple notifications marked as read',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Notifications marked as read',
        },
      },
    },
  })
  async marksAsReadMultiple(
    @User() user: OutputUserDto,
    @Body('ids') ids: number[],
  ) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException(
        'Invalid input: ids must be a non-empty array',
      );
    }
    await this.notificationsService.marksAsReadMultiple(+user.id, ids);
    return { message: 'Notifications marked as read' };
  }
}
