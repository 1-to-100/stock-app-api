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
import { PaginatedOutputDto } from '../common/dto/paginated-output.dto';
import { ListCustomersOutputDto } from './dto/list-customers-output.dto';
import { Prisma } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { ListUsersInputDto } from './dto/list-customers-input.dto';

type SubscriptionDataType = {
  id: number;
  name: string;
  email: string;
  status: string;
  subscriptionId?: number;
  managerId: number | null;
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
    listCustomersInput: ListUsersInputDto,
  ): Promise<PaginatedOutputDto<ListCustomersOutputDto>> {
    const where: Prisma.CustomerFindManyArgs['where'] = {};

    if (listCustomersInput.search !== undefined) {
      where.OR = [
        {
          name: {
            contains: listCustomersInput.search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: listCustomersInput.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const paginate = createPaginator({ perPage: listCustomersInput.perPage });
    const paginateResult = await paginate<
      SubscriptionDataType,
      Prisma.CustomerFindManyArgs
    >(
      this.prisma.customer,
      {
        where,
        include: {
          Subscription: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              User: true,
            },
          },
        },
        orderBy: {
          id: 'desc',
        },
      },
      {
        page: listCustomersInput.page,
      },
    );

    const mergeResult = paginateResult.data.map((customer) => {
      const subscription = customer.Subscription;

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        status: customer.status,
        subscriptionId: subscription!.id,
        subscriptionName: subscription!.name,
        managerId: customer.managerId,
        numberOfUsers: customer._count.User,
      };
    });

    return {
      data: mergeResult,
      meta: paginateResult.meta,
    };
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
        Subscription: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            User: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('No customer with given ID exists');
    }

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      status: customer.status,
      subscriptionId: customer.Subscription?.id,
      subscriptionName: customer.Subscription?.name,
      managerId: customer.managerId,
      numberOfUsers: customer._count.User,
    };
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    const { name, email, subscriptionId } = updateCustomerDto;

    if (name) {
      const existingCustomer = await this.prisma.customer.findFirst({
        where: { name },
      });
      if (existingCustomer) {
        throw new ConflictException(
          'Customer with the same name already exists',
        );
      }
    }

    if (email) {
      const existingEmailCustomer = await this.prisma.customer.findFirst({
        where: { email },
      });
      if (existingEmailCustomer) {
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
    throw new ConflictException('Customer can not be deleted');
  }
}
