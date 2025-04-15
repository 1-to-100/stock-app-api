import { Controller, Get } from '@nestjs/common';
import { SystemModulesService } from './system-modules.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('system-modules')
export class SystemModulesController {
  constructor(
    private readonly systemModulesService: SystemModulesService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  findAll() {
    return this.systemModulesService.getAllModules();
  }

  @Get('seed')
  async seed() {
    const modules = this.systemModulesService.getAllModules();

    const flatPermissions = modules.flatMap((mod) =>
      (mod.permissions ?? []).map((perm) => ({
        name: perm.name, // e.g. 'createUser:own'
        label: perm.label, // e.g. 'Create User (Own)'
      })),
    );

    for (const p of flatPermissions) {
      await this.prisma.permission.upsert({
        where: { name: p.name },
        update: {},
        create: {
          name: p.name,
          label: p.label,
        },
      });
    }

    console.log(
      `✅ Seed завершено: створено ${flatPermissions.length} permission(s)`,
    );
  }
}
