import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OutputTaxonomyDto } from '../taxonomies/dto/output-taxonomy.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly logger = new Logger(CustomersService.name);

  async create(createCustomerDto: CreateCustomerDto) {
    if (
      await this.prisma.customer.findFirst({
        where: { name: createCustomerDto.name },
      })
    ) {
      throw new ConflictException('Customer with the same name already exists');
    }
    return this.prisma.customer.create({ data: createCustomerDto });
  }

  findAll() {
    return this.prisma.customer.findMany();
  }

  getForTaxonomy(): Promise<OutputTaxonomyDto[]> {
    return this.prisma.customer.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }

  async findOne(id: number) {
    const customer = await this.prisma.customer.findFirst({ where: { id } });
    if (!customer) {
      throw new NotFoundException('No customer with given ID exists');
    }
    return customer;
  }

  update(id: number, updateCustomerDto: UpdateCustomerDto) {
    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  remove(id: number) {
    try {
      return this.prisma.customer.delete({ where: { id } });
    } catch (error) {
      this.logger.error(error);
      throw new ConflictException('Customer can not be deleted');
    }
  }
}
