import { Module } from '@nestjs/common';
import { TaxonomiesService } from './taxonomies.service';
import { TaxonomiesController } from './taxonomies.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CustomersService } from '../customers/customers.service';
import { RolesService } from '../roles/roles.service';
import { ManagersService } from '../managers/managers.service';

@Module({
  controllers: [TaxonomiesController],
  providers: [
    TaxonomiesService,
    CustomersService,
    RolesService,
    ManagersService,
    PrismaService,
  ],
  exports: [TaxonomiesService],
})
export class TaxonomiesModule {}
