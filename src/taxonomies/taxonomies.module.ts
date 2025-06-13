import { Module } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CustomersService } from '@/customers/customers.service';
import { RolesService } from '@/roles/roles.service';
import { ManagersService } from '@/managers/managers.service';
import { SubscriptionsService } from '@/subscriptions/subscriptions.service';
import { UsersService } from '@/users/users.service';
import { TaxonomiesService } from '@/taxonomies/taxonomies.service';
import { TaxonomiesController } from '@/taxonomies/taxonomies.controller';

@Module({
  controllers: [TaxonomiesController],
  providers: [
    TaxonomiesService,
    CustomersService,
    RolesService,
    ManagersService,
    SubscriptionsService,
    PrismaService,
    UsersService,
  ],
  exports: [TaxonomiesService],
})
export class TaxonomiesModule {}
