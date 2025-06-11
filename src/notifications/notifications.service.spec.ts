// import { Test, TestingModule } from '@nestjs/testing';
// import { NotificationsService } from '@/notifications/notifications.service';
// import { PrismaService } from '@/common/prisma/prisma.service';
// import { ConflictException, NotFoundException } from '@nestjs/common';
// import { NotificationTypes } from '@/notifications/constants/notification-types';
// import { NotificationChannel } from '@/notifications/constants/notification-channel';
// import * as supabaseClient from '@/common/helpers/supabase-client';
//
// jest.mock('@/common/helpers/supabase-client', () => ({
//   sendSupabaseNotification: jest.fn(),
// }));
//
// describe('NotificationsService', () => {
//   let service: NotificationsService;
//   let prismaService: PrismaService;
//
//   const mockPrismaService = {
//     notification: {
//       create: jest.fn(),
//       createMany: jest.fn(),
//       findUnique: jest.fn(),
//       findMany: jest.fn(),
//       update: jest.fn(),
//       updateMany: jest.fn(),
//       count: jest.fn(),
//     },
//     user: {
//       findMany: jest.fn(),
//       findUnique: jest.fn(),
//     },
//   };
//
//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         NotificationsService,
//         {
//           provide: PrismaService,
//           useValue: mockPrismaService,
//         },
//       ],
//     }).compile();
//
//     service = module.get<NotificationsService>(NotificationsService);
//     prismaService = module.get<PrismaService>(PrismaService);
//     jest.clearAllMocks();
//   });
//
//   describe('create', () => {
//     const mockCreateNotificationDto = {
//       type: NotificationTypes.IN_APP,
//       title: 'Test Notification',
//       message: 'Test message',
//       channel: NotificationChannel.info,
//     };
//
//     it('should create notification for a specific user', async () => {
//       const userId = 1;
//       const mockNotification = {
//         id: 1,
//         userId,
//         ...mockCreateNotificationDto,
//         isRead: false,
//         createdAt: new Date(),
//       };
//
//       mockPrismaService.notification.create.mockResolvedValue(mockNotification);
//       jest
//         .spyOn(supabaseClient, 'sendSupabaseNotification')
//         .mockResolvedValue(undefined);
//
//       const result = await service.create({
//         ...mockCreateNotificationDto,
//         userId,
//         customerId: 1,
//       });
//
//       expect(result).toEqual(mockNotification);
//       expect(mockPrismaService.notification.create).toHaveBeenCalledWith({
//         data: {
//           ...mockCreateNotificationDto,
//           userId,
//           customerId: 1,
//         },
//       });
//       expect(supabaseClient.sendSupabaseNotification).toHaveBeenCalledTimes(2);
//     });
//
//     it('should create notifications for all users of a customer', async () => {
//       const customerId = 1;
//       const mockUsers = [
//         { id: 1, customerId },
//         { id: 2, customerId },
//       ];
//
//       mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
//       mockPrismaService.notification.createMany.mockResolvedValue({ count: 2 });
//
//       const result = await service.create({
//         ...mockCreateNotificationDto,
//         customerId,
//       });
//
//       expect(result).toBeDefined();
//       expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
//         where: { customerId },
//       });
//       expect(mockPrismaService.notification.createMany).toHaveBeenCalled();
//     });
//
//     it('should throw ConflictException when no users found for customer', async () => {
//       const customerId = 1;
//       mockPrismaService.user.findMany.mockResolvedValue([]);
//
//       await expect(
//         service.create({
//           ...mockCreateNotificationDto,
//           customerId,
//         }),
//       ).rejects.toThrow(ConflictException);
//     });
//
//     it('should throw ConflictException when neither userId nor customerId provided', async () => {
//       await expect(service.create(mockCreateNotificationDto)).rejects.toThrow(
//         ConflictException,
//       );
//     });
//   });
//
//   describe('findOne', () => {
//     it('should return notification by id and userId', async () => {
//       const mockNotification = {
//         id: 1,
//         userId: 1,
//         type: NotificationTypes.IN_APP,
//         title: 'Test',
//         message: 'Test message',
//         isRead: false,
//         createdAt: new Date(),
//         User: {
//           id: 1,
//           email: 'test@example.com',
//           firstName: 'Test',
//           lastName: 'User',
//         },
//       };
//
//       mockPrismaService.notification.findUnique.mockResolvedValue(
//         mockNotification,
//       );
//
//       const result = await service.findOne(1, 1);
//
//       expect(result).toEqual(mockNotification);
//       expect(mockPrismaService.notification.findUnique).toHaveBeenCalledWith({
//         where: { id: 1, userId: 1 },
//         include: {
//           User: {
//             select: {
//               id: true,
//               email: true,
//               firstName: true,
//               lastName: true,
//             },
//           },
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
//     it('should throw NotFoundException when notification not found', async () => {
//       mockPrismaService.notification.findUnique.mockResolvedValue(null);
//
//       await expect(service.findOne(1, 1)).rejects.toThrow(NotFoundException);
//     });
//   });
//
//   describe('findAll', () => {
//     it('should return paginated notifications for user', async () => {
//       const mockPaginatedResult = {
//         data: [
//           {
//             id: 1,
//             userId: 1,
//             type: NotificationTypes.IN_APP,
//             title: 'Test',
//             message: 'Test message',
//             isRead: false,
//             createdAt: new Date(),
//           },
//         ],
//         meta: {
//           total: 1,
//           lastPage: 1,
//           currentPage: 1,
//           perPage: 10,
//         },
//       };
//
//       mockPrismaService.notification.findMany.mockResolvedValue(
//         mockPaginatedResult.data,
//       );
//       mockPrismaService.notification.count.mockResolvedValue(1);
//
//       const result = await service.findAll(1, {
//         page: 1,
//         perPage: 10,
//         type: NotificationTypes.IN_APP,
//         isRead: false,
//         channel: NotificationChannel.info,
//       });
//
//       expect(result).toBeDefined();
//       expect(result.data).toHaveLength(1);
//       expect(result.meta.total).toBe(1);
//     });
//   });
//
//   describe('markAsRead', () => {
//     it('should mark notification as read', async () => {
//       const mockNotification = {
//         id: 1,
//         userId: 1,
//         isRead: true,
//         readAt: new Date(),
//       };
//
//       mockPrismaService.notification.update.mockResolvedValue(mockNotification);
//       jest
//         .spyOn(supabaseClient, 'sendSupabaseNotification')
//         .mockResolvedValue(undefined);
//
//       const result = await service.markAsRead(1, 1);
//
//       expect(result).toEqual(mockNotification);
//       expect(mockPrismaService.notification.update).toHaveBeenCalledWith({
//         where: { id: 1, userId: 1 },
//         data: { isRead: true, readAt: expect.any(Date) },
//       });
//       expect(supabaseClient.sendSupabaseNotification).toHaveBeenCalled();
//     });
//
//     it('should throw NotFoundException when notification not found', async () => {
//       mockPrismaService.notification.update.mockResolvedValue(null);
//
//       await expect(service.markAsRead(1, 1)).rejects.toThrow(NotFoundException);
//     });
//   });
//
//   describe('markAllAsRead', () => {
//     it('should mark all notifications as read for user', async () => {
//       mockPrismaService.notification.updateMany.mockResolvedValue({ count: 2 });
//       jest
//         .spyOn(supabaseClient, 'sendSupabaseNotification')
//         .mockResolvedValue(undefined);
//
//       await service.markAllAsRead(1);
//
//       expect(mockPrismaService.notification.updateMany).toHaveBeenCalledWith({
//         where: { isRead: false, userId: 1 },
//         data: { isRead: true, readAt: expect.any(Date) },
//       });
//       expect(supabaseClient.sendSupabaseNotification).toHaveBeenCalled();
//     });
//   });
//
//   describe('unreadCount', () => {
//     it('should return count of unread notifications', async () => {
//       mockPrismaService.notification.count.mockResolvedValue(5);
//
//       const result = await service.unreadCount(1);
//
//       expect(result).toBe(5);
//       expect(mockPrismaService.notification.count).toHaveBeenCalledWith({
//         where: { isRead: false, userId: 1 },
//       });
//     });
//   });
//
//   describe('sendInAppNotification', () => {
//     it('should send in-app notification', async () => {
//       const mockNotification = {
//         userId: 1,
//         customerId: 1,
//         type: NotificationTypes.IN_APP,
//         title: 'Test',
//         message: 'Test message',
//       };
//
//       jest
//         .spyOn(supabaseClient, 'sendSupabaseNotification')
//         .mockResolvedValue(undefined);
//
//       await service.sendInAppNotification(mockNotification);
//
//       expect(supabaseClient.sendSupabaseNotification).toHaveBeenCalledWith(
//         `main-notifications:${mockNotification.userId}`,
//         'new',
//         mockNotification,
//       );
//     });
//
//     it('should not send notification if conditions are not met', async () => {
//       const mockNotification = {
//         type: NotificationTypes.EMAIL,
//         title: 'Test',
//         message: 'Test message',
//       };
//
//       await service.sendInAppNotification(mockNotification);
//
//       expect(supabaseClient.sendSupabaseNotification).not.toHaveBeenCalled();
//     });
//   });
// });
