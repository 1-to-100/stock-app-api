import { Controller, Get } from '@nestjs/common';
import { CustomersService } from '../customers/customers.service';
import { RolesService } from '../roles/roles.service';
import { ManagersService } from '../managers/managers.service';
import { ApiOkResponse } from '@nestjs/swagger';
import { OutputTaxonomyDto } from './dto/output-taxonomy.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { StatusList } from '../common/constants/status';

@Controller('taxonomies')
export class TaxonomiesController {
  constructor(
    private readonly customersService: CustomersService,
    private readonly rolesService: RolesService,
    private readonly managersService: ManagersService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Get('/customers')
  @ApiOkResponse({
    description: 'Customers',
    type: OutputTaxonomyDto,
  })
  findAllCustomers() {
    return this.customersService.getForTaxonomy();
  }

  @Get('/roles')
  @ApiOkResponse({
    description: 'Roles',
    type: OutputTaxonomyDto,
  })
  findAllRoles() {
    return this.rolesService.getForTaxonomy();
  }

  @Get('/managers')
  @ApiOkResponse({
    description: 'Managers',
    type: [OutputTaxonomyDto],
  })
  async findAllManagers() {
    return this.managersService.getForTaxonomy();
  }

  @Get('/subscriptions')
  @ApiOkResponse({
    description: 'Subscriptions',
    type: [OutputTaxonomyDto],
  })
  async findAllSubscriptions() {
    return this.subscriptionsService.getForTaxonomy();
  }

  @Get('/statuses')
  @ApiOkResponse({
    description: 'Statuses',
    type: [String],
  })
  statuses() {
    return StatusList;
  }
}
