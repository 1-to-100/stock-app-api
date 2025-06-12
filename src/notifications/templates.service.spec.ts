import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesService } from './templates.service';
import { PrismaService } from '@/common/prisma/prisma.service';
import { NotificationsService } from './notifications.service';
import { NotificationTypes } from '@/notifications/constants/notification-types';
import { NotificationChannel } from '@/notifications/constants/notification-channel';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { SendTemplatesInputDto } from './dto/send-templates-input.dto';

describe('TemplatesService', () => {
  let service: TemplatesService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let prismaService: PrismaService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let notificationsService: NotificationsService;

  const mockPrismaService = {
    notificationTemplate: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockNotificationsService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplatesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<TemplatesService>(TemplatesService);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationsService =
      module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a template by id', async () => {
      const mockTemplate = {
        id: 1,
        title: 'Test Template',
        message: 'Test Content',
        type: [NotificationTypes.IN_APP],
        channel: NotificationChannel.info,
        customerId: 1,
        Customer: {
          id: 1,
          name: 'Test Customer',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.notificationTemplate.findUnique.mockResolvedValue(
        mockTemplate,
      );

      const result = await service.findOne(1);
      expect(result).toBeDefined();
      expect(
        mockPrismaService.notificationTemplate.findUnique,
      ).toHaveBeenCalledWith({
        where: { id: 1, deletedAt: null },
        include: {
          Customer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    it('should throw an error if template not found', async () => {
      mockPrismaService.notificationTemplate.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        'Notification template with ID 999 not found',
      );
    });
  });

  describe('createTemplate', () => {
    it('should create a new template', async () => {
      const createTemplateDto: CreateTemplateDto = {
        title: 'New Template',
        message: 'New Content',
        type: [NotificationTypes.IN_APP],
        channel: NotificationChannel.info,
      };

      const mockCreatedTemplate = {
        id: 1,
        ...createTemplateDto,
        customerId: 1,
        Customer: {
          id: 1,
          name: 'Test Customer',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.notificationTemplate.create.mockResolvedValue(
        mockCreatedTemplate,
      );

      const result = await service.createTemplate(createTemplateDto);
      expect(result).toBeDefined();
      expect(
        mockPrismaService.notificationTemplate.create,
      ).toHaveBeenCalledWith({
        data: createTemplateDto,
        include: {
          Customer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });
  });

  describe('updateTemplate', () => {
    it('should update a template', async () => {
      const updateTemplateDto: UpdateTemplateDto = {
        title: 'Updated Template',
        message: 'Updated Content',
      };

      const mockUpdatedTemplate = {
        id: 1,
        ...updateTemplateDto,
        type: [NotificationTypes.IN_APP],
        channel: NotificationChannel.info,
        customerId: 1,
        Customer: {
          id: 1,
          name: 'Test Customer',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.notificationTemplate.update.mockResolvedValue(
        mockUpdatedTemplate,
      );

      const result = await service.updateTemplate(1, updateTemplateDto);
      expect(result).toBeDefined();
      expect(
        mockPrismaService.notificationTemplate.update,
      ).toHaveBeenCalledWith({
        where: { id: 1, deletedAt: null },
        data: updateTemplateDto,
        include: {
          Customer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });
  });

  describe('remove', () => {
    it('should soft delete a template', async () => {
      const mockDeletedTemplate = {
        id: 1,
        title: 'Test Template',
        message: 'Test Content',
        type: [NotificationTypes.IN_APP],
        channel: NotificationChannel.info,
        customerId: 1,
        Customer: {
          id: 1,
          name: 'Test Customer',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      };

      mockPrismaService.notificationTemplate.update.mockResolvedValue(
        mockDeletedTemplate,
      );

      const result = await service.remove(1);
      expect(result).toBeDefined();
      expect(
        mockPrismaService.notificationTemplate.update,
      ).toHaveBeenCalledWith({
        where: { id: 1, deletedAt: null },
        data: { deletedAt: new Date() },
        include: {
          Customer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });
  });

  describe('sendNotificationUsingTemplate', () => {
    it('should send a notification using a template', async () => {
      const templateId = 1;
      const sendTemplateInputDto: SendTemplatesInputDto = {
        customerId: 1,
        userIds: [1],
      };

      const mockTemplate = {
        id: 1,
        title: 'Test Template',
        message: 'Test Content',
        type: [NotificationTypes.IN_APP],
        channel: NotificationChannel.info,
        customerId: 1,
        Customer: {
          id: 1,
          name: 'Test Customer',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.notificationTemplate.findUnique.mockResolvedValue(
        mockTemplate,
      );
      mockNotificationsService.create.mockResolvedValue({
        id: 1,
        userId: 1,
        title: 'Test Template',
        content: 'Test Content',
        type: NotificationTypes.IN_APP,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.sendNotificationUsingTemplate(
        templateId,
        sendTemplateInputDto,
      );
      expect(result).toBeDefined();
      expect(
        mockPrismaService.notificationTemplate.findUnique,
      ).toHaveBeenCalledWith({
        where: { id: templateId, deletedAt: null },
        include: {
          Customer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      expect(mockNotificationsService.create).toHaveBeenCalled();
    });

    it('should throw an error if template not found', async () => {
      const templateId = 999;
      const sendTemplateInputDto: SendTemplatesInputDto = {
        customerId: 1,
        userIds: [1],
      };

      mockPrismaService.notificationTemplate.findUnique.mockResolvedValue(null);

      await expect(
        service.sendNotificationUsingTemplate(templateId, sendTemplateInputDto),
      ).rejects.toThrow('Notification template with ID 999 not found');
    });
  });
});
