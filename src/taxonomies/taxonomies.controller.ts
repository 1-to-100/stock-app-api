import { Controller, Get } from '@nestjs/common';
import { CustomersService } from '../customers/customers.service';
import { RolesService } from '../roles/roles.service';
import { ManagersService } from '../managers/managers.service';
import { ApiOkResponse } from '@nestjs/swagger';
import { OutputTaxonomyDto } from './dto/output-taxonomy.dto';

@Controller('taxonomies')
export class TaxonomiesController {
  constructor(
    private readonly customersService: CustomersService,
    private readonly rolesService: RolesService,
    private readonly managersService: ManagersService,
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
}
