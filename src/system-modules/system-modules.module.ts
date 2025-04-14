import { Module } from '@nestjs/common';
import { SystemModulesController } from './system-modules.controller';
import { SystemModulesService } from './system-modules.service';

@Module({
  controllers: [SystemModulesController],
  providers: [SystemModulesService]
})
export class SystemModulesModule {}
