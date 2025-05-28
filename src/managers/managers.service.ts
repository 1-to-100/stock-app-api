import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OutputManagerDto } from './dto/output-manager.dto';

@Injectable()
export class ManagersService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly logger = new Logger(ManagersService.name);

  async create(createManagerDto: CreateManagerDto) {
    if (
      await this.prisma.manager.findFirst({
        where: { name: createManagerDto.name },
      })
    ) {
      throw new ConflictException('Manager with the same name already exists');
    }
    return this.prisma.manager.create({ data: createManagerDto });
  }

  findAll() {
    return this.prisma.manager.findMany();
  }

  async getForTaxonomy(): Promise<OutputManagerDto[]> {
    const usersManagers = await this.prisma.user.findMany({
      where: { isCustomerSuccess: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    return usersManagers.map((manager) => ({
      id: manager.id,
      name: `${manager.firstName ?? ''} ${manager.lastName ?? ''}`.trim(),
      email: manager.email,
    })) as OutputManagerDto[];
  }

  async findOne(id: number) {
    const manager = await this.prisma.user.findFirst({
      where: { id, isCustomerSuccess: true },
    });
    if (!manager) {
      throw new NotFoundException('No manager with given ID exists');
    }
    return manager;
  }

  update(id: number, updateManagerDto: UpdateManagerDto) {
    return this.prisma.manager.update({
      where: { id },
      data: updateManagerDto,
    });
  }

  remove(id: number) {
    try {
      return this.prisma.manager.delete({ where: { id } });
    } catch (error) {
      this.logger.error(error);
      throw new ConflictException('Manager can not be deleted');
    }
  }
}
