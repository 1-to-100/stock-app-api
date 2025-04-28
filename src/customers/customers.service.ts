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
  status: string;
  subscriptionId?: number;
  managerId: number | null;
  createdAt?: Date;
  updatedAt?: Date;
  User: {
    firstName: string;
    lastName: string;
    email: string;
    status: string;
  }[];
  Subscription?: {
    id: number;
    name: string;
  };
};

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

    const existUser = await this.prisma.user.findFirst({
      where: { email: createCustomerDto.email },
    });

    if (!existUser) {
      throw new ConflictException('User with the given email does not exist');
    } else if (!existUser.emailVerified) {
      throw new ConflictException('User with the given email is not verified');
    } else if (existUser.status == 'inactive') {
      throw new ConflictException('User with status inactive');
    } else if (existUser.customerId != null) {
      throw new ConflictException('User already has a customer');
    } else if (existUser.managerId != null) {
      throw new ConflictException('User already has a manager');
    }

    const subscriptionExists = await this.prisma.subscription.findUnique({
      where: { id: createCustomerDto.subscriptionId },
    });
    if (!subscriptionExists) {
      throw new ConflictException(
        'Subscription with the given ID does not exist',
      );
    }

    const { name, subscriptionId, managerId } = createCustomerDto;
    const newCustomer = { name, subscriptionId, managerId };

    const createdCustomer = await this.prisma.customer.create({
      data: newCustomer,
    });

    await this.prisma.user.update({
      where: { id: existUser.id },
      data: { customerId: createdCustomer.id },
    });

    return createdCustomer;
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
          User: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              status: true,
            },
          },
          Subscription: {
            select: {
              id: true,
              name: true,
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
      const user = customer.User[0];
      const subscription = customer.Subscription;

      return {
        id: customer.id,
        name: customer.name,
        status: customer.status,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        subscriptionId: subscription!.id,
        subscriptionName: subscription!.name,
        managerId: customer.managerId,
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
