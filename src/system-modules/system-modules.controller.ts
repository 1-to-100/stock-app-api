import { Controller, Get } from '@nestjs/common';
import { SystemModulesService } from './system-modules.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Query } from '@nestjs/common';

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
  async seed(@Query('removeCustomers') removeCustomers?: boolean) {
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

    if (removeCustomers) {
      await this.prisma.user.updateMany({
        where: { customerId: { not: null } },
        data: { customerId: null },
      });

      const customers = await this.prisma.customer.findMany();
      for (const customer of customers) {
        await this.prisma.customer.delete({
          where: { id: customer.id },
        });
      }
      console.log(`✅ Видалено ${customers.length} customers`);
    }
  }
}
