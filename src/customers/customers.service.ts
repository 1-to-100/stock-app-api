import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { PaginatedOutputDto } from '@/common/dto/paginated-output.dto';
import { CustomerStatus, Prisma } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import {
  getDomainFromEmail,
  isPublicEmailDomain,
} from '@/common/helpers/string-helpers';
import { CreateCustomerDto } from '@/customers/dto/create-customer.dto';
import { ListCustomersInputDto } from '@/customers/dto/list-customers-input.dto';
import { ListCustomersOutputDto } from '@/customers/dto/list-customers-output.dto';
import { OutputTaxonomyDto } from '@/taxonomies/dto/output-taxonomy.dto';
import { UpdateCustomerDto } from '@/customers/dto/update-customer.dto';

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
  CustomerSuccess: {
    id: number;
    firstName: string;
    lastName: string;
    email: string | null;
  } | null;
  createdAt?: Date;
  updatedAt?: Date;
  Subscription?: {
    id: number;
    name: string;
  };
  _count: {
    Users: number;
  };
};

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const { name, email, subscriptionId, managerId, ownerId } =
      createCustomerDto;
    const owner = await this.prisma.user.findUnique({ where: { id: ownerId } });
    if (!owner) {
      throw new ConflictException(`Owner user not found with ID ${ownerId}`);
    }

    if (owner.customerId) {
      throw new ConflictException(
        'The user that is assigned as an owner should not belong to any other customer.',
      );
    }

    const existingCustomer = await this.prisma.customer.findFirst({
      where: { OR: [{ name }, { email }, { ownerId }] },
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
    const domain = getDomainFromEmail(email);
    if (!domain) {
      throw new ConflictException(
        'Email address does not contain a valid domain',
      );
    }
    if (isPublicEmailDomain(domain)) {
      throw new ConflictException(
        'Please use your work email instead of a personal one (@gmail, @yahoo, etc.) to connect with your company. Personal email domains cannot join existing companies.',
      );
    }
    const customer = await this.prisma.customer.create({
      data: { name, email, subscriptionId, domain, ownerId, managerId },
    });
    await this.prisma.user.update({
      where: { id: ownerId },
      data: { customerId: customer.id },
    });
    return customer;
  }

  async findAll(
    listCustomersInput: ListCustomersInputDto,
  ): Promise<PaginatedOutputDto<ListCustomersOutputDto>> {
    const {
      id,
      search,
      status,
      subscriptionId,
      managerId,
      perPage,
      page,
      customerSuccessId,
    } = listCustomersInput;

    const where: Prisma.CustomerFindManyArgs['where'] = {
      ...(id && { id: { in: id } }),
      ...(subscriptionId && { subscriptionId: { in: subscriptionId } }),
      ...(managerId && { managerId: { in: managerId } }),
      ...(managerId && { managerId: { in: managerId } }),
      ...(customerSuccessId && {
        customerSuccessId: { in: customerSuccessId },
      }),
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
          CustomerSuccess: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          Subscription: { select: { id: true, name: true } },
          _count: {
            select: {
              Users: {
                where: { isSuperadmin: false, isCustomerSuccess: false },
              },
            },
          },
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
        customerSuccess: customer.CustomerSuccess
          ? {
              id: customer.CustomerSuccess.id,
              name: `${customer.CustomerSuccess.firstName ?? ''} ${customer.CustomerSuccess.lastName ?? ''}`.trim(),
              email: customer.CustomerSuccess.email,
            }
          : null,
        manager: customer.Manager
          ? {
              id: customer.Manager?.id,
              name: customer.Manager?.name,
              email: customer.Manager?.Users[0].email || null,
            }
          : null,
        subscriptionId: customer.Subscription?.id,
        subscriptionName: customer.Subscription?.name,
        numberOfUsers: customer._count.Users,
      };
    });

    return { data, meta: paginateResult.meta };
  }

  getForTaxonomy(customerId: number | null): Promise<OutputTaxonomyDto[]> {
    let where = {};
    if (customerId) {
      where = {
        id: customerId,
      };
    }
    return this.prisma.customer.findMany({
      select: {
        id: true,
        name: true,
      },
      where,
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
        CustomerSuccess: {
          select: { id: true, firstName: true, lastName: true },
        },
        Subscription: { select: { id: true, name: true } },
        Owner: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { Users: true } },
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
      customerSuccess: customer.CustomerSuccess
        ? {
            id: customer.CustomerSuccess.id,
            name: `${customer.CustomerSuccess.firstName ?? ''} ${customer.CustomerSuccess.lastName ?? ''}`.trim(),
            email: customer.CustomerSuccess.lastName,
          }
        : null,
      manager: customer.Manager
        ? {
            id: customer.Manager?.id,
            name: customer.Manager?.name,
            email: customer.Manager?.Users[0].email ?? null,
          }
        : null,
      owner: customer.Owner
        ? {
            id: customer.Owner?.id,
            firstName: customer.Owner?.firstName,
            lastName: customer.Owner?.lastName,
          }
        : null,
      subscriptionId: Subscription?.id,
      subscriptionName: Subscription?.name,
      numberOfUsers: _count.Users,
    };
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    const { name, email, subscriptionId, ownerId } = updateCustomerDto;

    await this.validateCustomerName(id, name);
    await this.validateCustomerEmail(id, email);
    await this.validateSubscription(subscriptionId);
    await this.validateOwner(id, ownerId);

    if (ownerId) {
      await this.prisma.user.update({
        where: { id: ownerId },
        data: { customerId: id },
      });
    }

    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  private async validateCustomerName(id: number, name?: string) {
    if (!name) return;

    const existingCustomer = await this.prisma.customer.findFirst({
      where: { name },
    });
    if (existingCustomer && existingCustomer.id !== id) {
      throw new ConflictException('Customer with the same name already exists');
    }
  }

  private async validateCustomerEmail(id: number, email?: string) {
    if (!email) return;

    const existingEmailCustomer = await this.prisma.customer.findFirst({
      where: { email },
    });
    if (existingEmailCustomer && existingEmailCustomer.id !== id) {
      throw new ConflictException(
        'Customer with the same email already exists',
      );
    }
  }

  private async validateSubscription(subscriptionId?: number) {
    if (!subscriptionId) return;

    const subscriptionExists = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });
    if (!subscriptionExists) {
      throw new ConflictException(
        'Subscription with the given ID does not exist',
      );
    }
  }

  private async validateOwner(id: number, ownerId?: number) {
    if (!ownerId) return;

    const newOwner = await this.prisma.user.findUnique({
      where: { id: ownerId },
    });
    if (!newOwner) {
      throw new ConflictException('Owner with the given ID does not exist');
    }
    if (newOwner.customerId && newOwner.customerId !== id) {
      throw new ConflictException(
        'The user that is assigned as an owner should either belong to this customer or do not belong to any',
      );
    }
  }

  remove(id: number) {
    throw new ConflictException(`Customer with ${id} can not be deleted`);
  }
}
