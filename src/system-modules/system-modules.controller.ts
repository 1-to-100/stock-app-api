import { Controller, Get } from '@nestjs/common';
import { SystemModulesService } from './system-modules.service';

@Controller('system-modules')
export class SystemModulesController {
  constructor(private readonly systemModulesService: SystemModulesService) {}

  @Get()
  findAll() {
    return this.systemModulesService.getAllModules();
  }
}
