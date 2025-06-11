// import { Test, TestingModule } from '@nestjs/testing';
// import { TemplatesService } from '@/notifications/templates.service';
// import { PrismaService } from '@/common/prisma/prisma.service';
// import { NotificationsService } from '@/notifications/notifications.service';
// import { NotificationTypes } from '@/notifications/constants/notification-types';
// import { NotificationChannel } from '@/notifications/constants/notification-channel';
//
// describe('TemplatesService', () => {
//   let service: TemplatesService;
//   let prismaService: PrismaService;
//   let notificationsService: NotificationsService;
//
//   const mockPrismaService = {
//     notificationTemplate: {
//       findMany: jest.fn(),
//       findUnique: jest.fn(),
//       create: jest.fn(),
//       update: jest.fn(),
//       count: jest.fn(),
//     },
//   };
//
//   const mockNotificationsService = {
//     create: jest.fn(),
//   };
//
//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         TemplatesService,
//         {
//           provide: PrismaService,
//           useValue: mockPrismaService,
//         },
//         {
//           provide: NotificationsService,
//           useValue: mockNotificationsService,
//         },
//       ],
//     }).compile();
//
//     service = module.get<TemplatesService>(TemplatesService);
//     prismaService = module.get<PrismaService>(PrismaService);
//     notificationsService =
//       module.get<NotificationsService>(NotificationsService);
//     jest.clearAllMocks();
//   });
//
//   describe('findAll', () => {
//     const mockQuery = {
//       page: 1,
//       perPage: 10,
//       customerId: 1,
//       type: [NotificationTypes.IN_APP],
//       channel: [NotificationChannel.info],
//     };
//
//     it('should return paginated templates', async () => {
//       const mockTemplates = [
//         {
//           id: 1,
//           title: 'Test Template',
//           message: 'Test message',
//           type: [NotificationTypes.IN_APP],
//           channel: NotificationChannel.info,
//           customerId: 1,
//           Customer: {
//             id: 1,
//             name: 'Test Customer',
//           },
//           createdAt: new Date(),
//         },
//       ];
//
//       mockPrismaService.notificationTemplate.findMany.mockResolvedValue(
//         mockTemplates,
//       );
//       mockPrismaService.notificationTemplate.count.mockResolvedValue(1);
//
//       const result = await service.findAll(mockQuery);
//
//       expect(result).toBeDefined();
//       expect(result.data).toHaveLength(1);
//       expect(result.meta.total).toBe(1);
//       expect(
//         mockPrismaService.notificationTemplate.findMany,
//       ).toHaveBeenCalled();
//     });
//
//     it('should handle search query', async () => {
//       const searchQuery = {
//         ...mockQuery,
//         search: 'test',
//       };
//
//       await service.findAll(searchQuery);
//
//       expect(
//         mockPrismaService.notificationTemplate.findMany,
//       ).toHaveBeenCalledWith(
//         expect.objectContaining({
//           where: expect.objectContaining({
//             OR: expect.arrayContaining([
//               expect.objectContaining({
//                 title: expect.objectContaining({
//                   contains: 'test',
//                   mode: 'insensitive',
//                 }),
//               }),
//             ]),
//           }),
//         }),
//       );
//     });
//   });
//
//   describe('findOne', () => {
//     it('should return template by id', async () => {
//       const mockTemplate = {
//         id: 1,
//         title: 'Test Template',
//         message: 'Test message',
//         type: [NotificationTypes.IN_APP],
//         channel: NotificationChannel.info,
//         customerId: 1,
//         Customer: {
//           id: 1,
//           name: 'Test Customer',
//         },
//         createdAt: new Date(),
//       };
//
//       mockPrismaService.notificationTemplate.findUnique.mockResolvedValue(
//         mockTemplate,
//       );
//
//       const result = await service.findOne(1, 1);
//
//       expect(result).toBeDefined();
//       expect(result.id).toBe(1);
//       expect(
//         mockPrismaService.notificationTemplate.findUnique,
//       ).toHaveBeenCalledWith({
//         where: { id: 1, customerId: 1, deletedAt: null },
//         include: {
//           Customer: {
//             select: {
//               id: true,
//               name: true,
//             },
//           },
//         },
//       });
//     });
//
//     it('should throw error when template not found', async () => {
//       mockPrismaService.notificationTemplate.findUnique.mockResolvedValue(null);
//
//       await expect(service.findOne(1, 1)).rejects.toThrow(
//         'Notification template with ID 1 not found',
//       );
//     });
//   });
//
//   describe('createTemplate', () => {
//     const mockCreateTemplateDto = {
//       title: 'Test Template',
//       message: 'Test message',
//       type: [NotificationTypes.IN_APP],
//       channel: NotificationChannel.info,
//     };
//
//     it('should create template', async () => {
//       const mockTemplate = {
//         id: 1,
//         ...mockCreateTemplateDto,
//         customerId: 1,
//         Customer: {
//           id: 1,
//           name: 'Test Customer',
//         },
//         createdAt: new Date(),
//       };
//
//       mockPrismaService.notificationTemplate.create.mockResolvedValue(
//         mockTemplate,
//       );
//
//       const result = await service.createTemplate(mockCreateTemplateDto, 1);
//
//       expect(result).toBeDefined();
//       expect(result.id).toBe(1);
//       expect(
//         mockPrismaService.notificationTemplate.create,
//       ).toHaveBeenCalledWith({
//         data: {
//           ...mockCreateTemplateDto,
//           customerId: 1,
//         },
//         include: {
//           Customer: {
//             select: {
//               id: true,
//               name: true,
//             },
//           },
//         },
//       });
//     });
//   });
//
//   describe('updateTemplate', () => {
//     const mockUpdateTemplateDto = {
//       title: 'Updated Template',
//       message: 'Updated message',
//     };
//
//     it('should update template', async () => {
//       const mockTemplate = {
//         id: 1,
//         ...mockUpdateTemplateDto,
//         type: [NotificationTypes.IN_APP],
//         channel: NotificationChannel.info,
//         customerId: 1,
//         Customer: {
//           id: 1,
//           name: 'Test Customer',
//         },
//         createdAt: new Date(),
//       };
//
//       mockPrismaService.notificationTemplate.update.mockResolvedValue(
//         mockTemplate,
//       );
//
//       const result = await service.updateTemplate(1, mockUpdateTemplateDto, 1);
//
//       expect(result).toBeDefined();
//       expect(result.id).toBe(1);
//       expect(result.title).toBe('Updated Template');
//       expect(
//         mockPrismaService.notificationTemplate.update,
//       ).toHaveBeenCalledWith({
//         where: { id: 1, deletedAt: null, customerId: 1 },
//         data: { ...mockUpdateTemplateDto, customerId: 1 },
//         include: {
//           Customer: {
//             select: {
//               id: true,
//               name: true,
//             },
//           },
//         },
//       });
//     });
//   });
//
//   describe('remove', () => {
//     it('should soft delete template', async () => {
//       const mockTemplate = {
//         id: 1,
//         title: 'Test Template',
//         message: 'Test message',
//         type: [NotificationTypes.IN_APP],
//         channel: NotificationChannel.info,
//         customerId: 1,
//         Customer: {
//           id: 1,
//           name: 'Test Customer',
//         },
//         createdAt: new Date(),
//         deletedAt: new Date(),
//       };
//
//       mockPrismaService.notificationTemplate.update.mockResolvedValue(
//         mockTemplate,
//       );
//
//       const result = await service.remove(1, 1);
//
//       expect(result).toBeDefined();
//       expect(result.id).toBe(1);
//       expect(
//         mockPrismaService.notificationTemplate.update,
//       ).toHaveBeenCalledWith({
//         where: { id: 1, customerId: 1, deletedAt: null },
//         data: { deletedAt: expect.any(Date) },
//         include: {
//           Customer: {
//             select: {
//               id: true,
//               name: true,
//             },
//           },
//         },
//       });
//     });
//   });
//
//   describe('sendNotificationUsingTemplate', () => {
//     const mockTemplate = {
//       id: 1,
//       title: 'Test Template',
//       message: 'Test message',
//       type: [NotificationTypes.IN_APP],
//       channel: NotificationChannel.info,
//       customerId: 1,
//       Customer: {
//         id: 1,
//         name: 'Test Customer',
//       },
//       createdAt: new Date(),
//     };
//
//     it('should send notification to all users of a customer', async () => {
//       mockPrismaService.notificationTemplate.findUnique.mockResolvedValue(
//         mockTemplate,
//       );
//       mockNotificationsService.create.mockResolvedValue({});
//
//       const result = await service.sendNotificationUsingTemplate(1, {
//         customerId: 1,
//       });
//
//       expect(result).toBeDefined();
//       expect(result.id).toBe(1);
//       expect(mockNotificationsService.create).toHaveBeenCalledWith({
//         customerId: 1,
//         title: 'Test Template',
//         message: 'Test message',
//         type: NotificationTypes.IN_APP,
//         channel: NotificationChannel.info,
//       });
//     });
//
//     it('should send notification to specific users', async () => {
//       mockPrismaService.notificationTemplate.findUnique.mockResolvedValue(
//         mockTemplate,
//       );
//       mockNotificationsService.create.mockResolvedValue({});
//
//       const result = await service.sendNotificationUsingTemplate(1, {
//         userIds: [1, 2],
//       });
//
//       expect(result).toBeDefined();
//       expect(result.id).toBe(1);
//       expect(mockNotificationsService.create).toHaveBeenCalledTimes(2);
//     });
//
//     it('should throw error when template not found', async () => {
//       mockPrismaService.notificationTemplate.findUnique.mockResolvedValue(null);
//
//       await expect(
//         service.sendNotificationUsingTemplate(1, { customerId: 1 }),
//       ).rejects.toThrow('Notification template with ID 1 not found');
//     });
//
//     it('should throw error when template type is EMAIL', async () => {
//       const emailTemplate = {
//         ...mockTemplate,
//         type: [NotificationTypes.EMAIL],
//       };
//
//       mockPrismaService.notificationTemplate.findUnique.mockResolvedValue(
//         emailTemplate,
//       );
//
//       await expect(
//         service.sendNotificationUsingTemplate(1, { customerId: 1 }),
//       ).rejects.toThrow(
//         'Template with ID 1 is of type EMAIL, which is not supported for sending notifications.',
//       );
//     });
//   });
// });
