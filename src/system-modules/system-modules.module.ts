import { Module } from '@nestjs/common';
import { SystemModulesController } from './system-modules.controller';
import { SystemModulesService } from './system-modules.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [SystemModulesController],
  providers: [SystemModulesService, PrismaService],
})
export class SystemModulesModule {}
