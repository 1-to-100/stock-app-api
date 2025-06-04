import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { User } from '../common/decorators/user.decorator';
import { OutputUserDto } from '../users/dto/output-user.dto';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateTemplateDto } from './dto/create-template.dto';
import { TemplatesService } from './templates.service';
import { DynamicAuthGuard } from '../auth/guards/dynamic-auth/dynamic-auth.guard';
import { NotificationTemplateDto } from './dto/notification-template.dto';
import { CustomerId } from '../common/decorators/customer-id.decorator';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { ListTemplatesInputDto } from './dto/list-templates-input.dto';
import { PaginatedOutputDto } from '../common/dto/paginated-output.dto';
import { ApiPaginatedResponse } from '../common/decorators/api-paginated-response.decorator';
import { SendTemplatesInputDto } from './dto/send-templates-input.dto';

@ApiTags('Notification Templates')
@Controller('notification/templates')
@UseGuards(DynamicAuthGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  @ApiPaginatedResponse(NotificationTemplateDto)
  @ApiOkResponse({
    description: 'Get all notification templates.',
    type: PaginatedOutputDto,
    isArray: true,
  })
  async findAllTemplates(
    @User() user: OutputUserDto,
    @Query() query: ListTemplatesInputDto,
    @CustomerId() customerId: number | null,
  ): Promise<PaginatedOutputDto<NotificationTemplateDto>> {
    if (!user.isSuperadmin && !user.isCustomerSuccess) {
      throw new ForbiddenException(
        'User is not authorized to access notification templates',
      );
    }

    query.customerId =
      user.isSuperadmin && customerId
        ? customerId
        : user.customerId || undefined;

    return this.templatesService.findAll(query);
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Get a notification template by ID.',
    type: NotificationTemplateDto,
  })
  @ApiParam({ name: 'id', type: Number })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @User() user: OutputUserDto,
    @CustomerId() customerId: number | null,
  ): Promise<NotificationTemplateDto> {
    if (!user.isSuperadmin && !user.isCustomerSuccess) {
      throw new ForbiddenException(
        'User is not authorized to access notification templates',
      );
    }

    const attachCustomerId =
      user.isSuperadmin && customerId
        ? customerId
        : user.customerId || undefined;

    try {
      const template = await this.templatesService.findOne(
        id,
        attachCustomerId,
      );

      return template;
    } catch {
      throw new ForbiddenException(
        'Notification template not found or you do not have access to it',
      );
    }
  }

  @Post()
  @ApiOkResponse({
    description:
      'Create a notification template. Only system admin and customer success can create templates.',
  })
  async createTemplate(
    @User() user: OutputUserDto,
    @Body() createTemplateDto: CreateTemplateDto,
    @CustomerId() customerId: number | null,
  ): Promise<NotificationTemplateDto> {
    if (!user.isSuperadmin && !user.isCustomerSuccess) {
      throw new ForbiddenException(
        'User is not authorized to create notification templates',
      );
    } else if (user.isCustomerSuccess && !user.customerId) {
      throw new ForbiddenException(
        'Customer success user must have a customerId to create templates',
      );
    }

    const attachCustomerId =
      user.isSuperadmin && customerId
        ? customerId
        : user.customerId || undefined;

    return this.templatesService.createTemplate(
      createTemplateDto,
      attachCustomerId,
    );
  }

  @Patch(':id')
  @ApiOkResponse({
    description: 'Update a notification template.',
  })
  @ApiParam({ name: 'id', type: Number })
  async updateTemplate(
    @Param('id', ParseIntPipe) id: number,
    @User() user: OutputUserDto,
    @Body() updateTemplateDto: UpdateTemplateDto,
    @CustomerId() customerId: number | null,
  ): Promise<NotificationTemplateDto> {
    if (!user.isSuperadmin && !user.isCustomerSuccess) {
      throw new ForbiddenException(
        'User is not authorized to update notification templates',
      );
    } else if (user.isCustomerSuccess && !user.customerId) {
      throw new ForbiddenException(
        'Customer success user must have a customerId to update templates',
      );
    }

    const attachCustomerId =
      user.isSuperadmin && customerId
        ? customerId
        : user.customerId || undefined;

    return this.templatesService.updateTemplate(
      id,
      updateTemplateDto,
      attachCustomerId,
    );
  }

  @Delete(':id')
  @ApiOkResponse({
    description: 'Delete a notification template.',
    type: NotificationTemplateDto,
  })
  @ApiParam({ name: 'id', type: Number })
  async deleteTemplate(
    @Param('id', ParseIntPipe) id: number,
    @User() user: OutputUserDto,
    @CustomerId() customerId: number | null,
  ) {
    if (!user.isSuperadmin && !user.isCustomerSuccess) {
      throw new ForbiddenException(
        'User is not authorized to delete notification templates',
      );
    } else if (user.isCustomerSuccess && !user.customerId) {
      throw new ForbiddenException(
        'Customer success user must have a customerId to delete templates',
      );
    }

    const attachCustomerId =
      user.isSuperadmin && customerId
        ? customerId
        : user.customerId || undefined;

    return this.templatesService.remove(id, attachCustomerId);
  }

  @Post('/send/:templateId')
  @ApiOkResponse({
    description: 'Send a notification using a template.',
    type: NotificationTemplateDto,
  })
  @ApiParam({ name: 'templateId', type: Number })
  async sendNotificationUsingTemplate(
    @Param('templateId', ParseIntPipe) templateId: number,
    @User() user: OutputUserDto,
    @Body() sendTemplateInputDto: SendTemplatesInputDto,
    @CustomerId() customerId: number | null,
  ): Promise<NotificationTemplateDto> {
    if (!user.isSuperadmin && !user.isCustomerSuccess) {
      throw new ForbiddenException(
        'User is not authorized to send notifications using templates',
      );
    }

    if (!sendTemplateInputDto.userIds && !sendTemplateInputDto.customerId) {
      throw new ForbiddenException(
        'Notification must be associated with a users or customer',
      );
    }

    if (user.isSuperadmin && customerId) {
      sendTemplateInputDto.customerId = customerId;
    } else if (user.isCustomerSuccess && !user.customerId) {
      throw new ForbiddenException(
        'Customer success user must have a customerId to send notifications using templates',
      );
    } else if (
      user.isCustomerSuccess &&
      user.customerId != customerId &&
      customerId !== null
    ) {
      throw new ForbiddenException(
        'Customer success user cannot send notifications for a different customer',
      );
    }

    try {
      const template =
        await this.templatesService.sendNotificationUsingTemplate(
          templateId,
          sendTemplateInputDto,
        );

      return template;
    } catch (error: unknown) {
      throw new ForbiddenException(
        `Failed to send notification using template: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }
}
