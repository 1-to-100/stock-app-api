import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OutputTaxonomyDto } from '../taxonomies/dto/output-taxonomy.dto';
import { PaginatedOutputDto } from '../common/dto/paginated-output.dto';
import { ListCustomersOutputDto } from './dto/list-customers-output.dto';
import { CustomerStatus, Prisma } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { ListCustomersInputDto } from './dto/list-customers-input.dto';

type SubscriptionDataType = {
  id: number;
  name: string;
  email: string;
  status: string;
  subscriptionId?: number;
  Manager: {
    id: number;
    name: string;
    Users: { email: string }[];
  };
  createdAt?: Date;
  updatedAt?: Date;
  Subscription?: {
    id: number;
    name: string;
  };
  _count: {
    User: number;
  };
};

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const { name, email, subscriptionId, managerId } = createCustomerDto;

    const existingCustomer = await this.prisma.customer.findFirst({
      where: { OR: [{ name }, { email }] },
    });

    if (existingCustomer) {
      throw new ConflictException(
        `Customer with the same ${existingCustomer.name === name ? 'name' : 'email'} already exists`,
      );
    }

    const subscriptionExists = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });
    if (!subscriptionExists) {
      throw new ConflictException(
        'Subscription with the given ID does not exist',
      );
    }

    return this.prisma.customer.create({
      data: { name, email, subscriptionId, managerId },
    });
  }

  async findAll(
    listCustomersInput: ListCustomersInputDto,
  ): Promise<PaginatedOutputDto<ListCustomersOutputDto>> {
    const { id, search, status, subscriptionId, managerId, perPage, page } =
      listCustomersInput;

    const where: Prisma.CustomerFindManyArgs['where'] = {
      ...(id && { id: { in: id } }),
      ...(subscriptionId && { subscriptionId: { in: subscriptionId } }),
      ...(managerId && { managerId: { in: managerId } }),
      ...(status && {
        status: {
          in: status.map((s) => s as CustomerStatus),
        },
      }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const paginate = createPaginator({ perPage });
    const paginateResult = await paginate<
      SubscriptionDataType,
      Prisma.CustomerFindManyArgs
    >(
      this.prisma.customer,
      {
        where,
        include: {
          Manager: {
            select: {
              id: true,
              name: true,
              Users: { select: { email: true }, take: 1 },
            },
          },
          Subscription: { select: { id: true, name: true } },
          _count: { select: { User: true } },
        },
        orderBy: { id: 'desc' },
      },
      { page },
    );

    const data = paginateResult.data.map((customer) => {
      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        status: customer.status,
        manager: customer.Manager
          ? {
              id: customer.Manager?.id,
              name: customer.Manager?.name,
              email: customer.Manager?.Users[0].email || null,
            }
          : null,
        subscriptionId: customer.Subscription!.id,
        subscriptionName: customer.Subscription!.name,
        numberOfUsers: customer._count.User,
      };
    });

    return { data, meta: paginateResult.meta };
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
    const customer = await this.prisma.customer.findFirst({
      where: { id },
      include: {
        Manager: {
          select: {
            id: true,
            name: true,
            Users: { select: { email: true }, take: 1 },
          },
        },
        Subscription: { select: { id: true, name: true } },
        _count: { select: { User: true } },
      },
    });

    if (!customer) {
      throw new NotFoundException('No customer with given ID exists');
    }

    const { Subscription, _count } = customer;

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      status: customer.status,
      manager: customer.Manager
        ? {
            id: customer.Manager?.id,
            name: customer.Manager?.name,
            email: customer.Manager?.Users[0].email || null,
          }
        : null,
      subscriptionId: Subscription?.id,
      subscriptionName: Subscription?.name,
      numberOfUsers: _count.User,
    };
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    const { name, email, subscriptionId } = updateCustomerDto;

    if (name) {
      const existingCustomer = await this.prisma.customer.findFirst({
        where: { name },
      });
      if (existingCustomer && existingCustomer.id !== id) {
        throw new ConflictException(
          'Customer with the same name already exists',
        );
      }
    }

    if (email) {
      const existingEmailCustomer = await this.prisma.customer.findFirst({
        where: { email },
      });
      if (existingEmailCustomer && existingEmailCustomer.id !== id) {
        throw new ConflictException(
          'Customer with the same email already exists',
        );
      }
    }

    if (subscriptionId) {
      const subscriptionExists = await this.prisma.subscription.findUnique({
        where: { id: subscriptionId },
      });
      if (!subscriptionExists) {
        throw new ConflictException(
          'Subscription with the given ID does not exist',
        );
      }
    }

    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  remove(id: number) {
    throw new ConflictException(`Customer with ${id} can not be deleted`);
  }
}
