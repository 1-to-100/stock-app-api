import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { SubscriptionSeederService } from '../services/subscription-seeder.service';

@Injectable()
export class CleanupCommand {
  private readonly logger = new Logger(CleanupCommand.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionSeederService: SubscriptionSeederService,
  ) {}

  async execute(): Promise<void> {
    this.logger.log('Starting test data cleanup...');

    try {
      // Find test customer
      const testCustomer = await this.prisma.customer.findFirst({
        where: { name: 'Test Customer Inc.' },
        include: {
          Users: true,
          Articles: true,
          Notification: true,
          NotificationTemplate: true,
        },
      });

      if (!testCustomer) {
        this.logger.warn('No test customer found to clean up.');
        return;
      }

      this.logger.log(`Found test customer: ${testCustomer.name} (ID: ${testCustomer.id})`);

      // Delete in correct order to respect foreign key constraints
      let deletedCount = 0;

      // 1. Delete notifications
      const deletedNotifications = await this.prisma.notification.deleteMany({
        where: { customerId: testCustomer.id },
      });
      deletedCount += deletedNotifications.count;
      this.logger.log(`Deleted ${deletedNotifications.count} notifications`);

      // 2. Delete notification templates
      const deletedTemplates = await this.prisma.notificationTemplate.deleteMany({
        where: { customerId: testCustomer.id },
      });
      deletedCount += deletedTemplates.count;
      this.logger.log(`Deleted ${deletedTemplates.count} notification templates`);

      // 3. Delete articles
      const deletedArticles = await this.prisma.article.deleteMany({
        where: { customerId: testCustomer.id },
      });
      deletedCount += deletedArticles.count;
      this.logger.log(`Deleted ${deletedArticles.count} articles`);

      // 4. Delete article categories
      const deletedCategories = await this.prisma.articleCategory.deleteMany({
        where: { customerId: testCustomer.id },
      });
      deletedCount += deletedCategories.count;
      this.logger.log(`Deleted ${deletedCategories.count} article categories`);

      // 5. Delete users (soft delete by setting deletedAt and nullifying customerId)
      const usersToDelete = await this.prisma.user.findMany({
        where: { customerId: testCustomer.id },
        select: { id: true, email: true },
      });

      for (const user of usersToDelete) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            deletedAt: new Date(),
            email: `__deleted__${user.id}_${new Date().getTime()}@deleted.com`,
            status: 'suspended',
            customerId: null, // Remove foreign key reference
          },
        });
      }
      deletedCount += usersToDelete.length;
      this.logger.log(`Soft deleted ${usersToDelete.length} users`);

      // 6. Delete customer
      try {
        await this.prisma.customer.delete({
          where: { id: testCustomer.id },
        });
        deletedCount += 1;
        this.logger.log(`Deleted customer: ${testCustomer.name}`);
      } catch (error) {
        this.logger.error(`Failed to delete customer ${testCustomer.name}:`, error);
        // Continue with cleanup even if customer deletion fails
      }

      // 7. Clean up test subscription only (keep other subscriptions)
      const testSubscription = await this.prisma.subscription.findFirst({
        where: { name: 'Test Subscription' },
      });

      if (testSubscription) {
        await this.prisma.subscription.delete({
          where: { id: testSubscription.id },
        });
        deletedCount += 1;
        this.logger.log(`Deleted test subscription: ${testSubscription.name}`);
      }

      // 8. Clean up any orphaned users (users without customerId that might be test users)
      const orphanedUsers = await this.prisma.user.findMany({
        where: {
          email: {
            contains: '@testcustomer.com',
          },
          customerId: null,
        },
      });

      if (orphanedUsers.length > 0) {
        for (const user of orphanedUsers) {
          await this.prisma.user.update({
            where: { id: user.id },
            data: {
              deletedAt: new Date(),
              email: `__deleted__${user.id}_${new Date().getTime()}@deleted.com`,
              status: 'suspended',
            },
          });
        }
        deletedCount += orphanedUsers.length;
        this.logger.log(`Soft deleted ${orphanedUsers.length} orphaned test users`);
      }

      this.logger.log(`Test data cleanup completed successfully! Total items deleted: ${deletedCount}`);

    } catch (error) {
      this.logger.error('Error during cleanup:', error);
      throw error;
    }
  }
}
