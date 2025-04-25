import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OutputTaxonomyDto } from '../taxonomies/dto/output-taxonomy.dto';

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

  getForTaxonomy(): Promise<OutputTaxonomyDto[]> {
    return this.prisma.manager.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }

  async findOne(id: number) {
    const manager = await this.prisma.manager.findFirst({ where: { id } });
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
