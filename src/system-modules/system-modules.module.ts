import { Module } from '@nestjs/common';
import { SystemModulesController } from '@/system-modules/system-modules.controller';
import { SystemModulesService } from '@/system-modules/system-modules.service';
import { PrismaService } from '@/common/prisma/prisma.service';

@Module({
  controllers: [SystemModulesController],
  providers: [SystemModulesService, PrismaService],
})
export class SystemModulesModule {}
