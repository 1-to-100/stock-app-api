import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ArticleDto } from './dto/article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ListArticlesInputDto } from './dto/list-articles-input.dto';
import { Prisma } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { PaginatedOutputDto } from '../common/dto/paginated-output.dto';
import { ListArticlesOutputDto } from './dto/list-articles-output.dto';

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(createArticleDto: ArticleDto) {
    try {
      this.logger.log(`Create article with title ${createArticleDto.title}`);
      return this.prisma.article.create({
        data: createArticleDto,
      });
    } catch (error) {
      this.logger.error(`Error creating article: ${error}`);
      throw new ConflictException('Article cannot be created.');
    }
  }

  async findAll(
    customerId: number,
    listArticlesInputDto: ListArticlesInputDto,
  ): Promise<PaginatedOutputDto<ListArticlesOutputDto>> {
    const { categoryId, status, search, perPage, page } = listArticlesInputDto;
    console.log('listArticlesInputDto', listArticlesInputDto);
    const where: Prisma.ArticleFindManyArgs['where'] = {
      customerId,
      ...(categoryId && { articleCategoryId: { in: categoryId } }),
      ...(status && {
        status: {
          in: status,
        },
      }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { subcategory: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const paginate = createPaginator({ perPage });
    const paginateResult = await paginate<
      ListArticlesOutputDto,
      Prisma.ArticleFindManyArgs
    >(
      this.prisma.article,
      {
        where,
        include: {
          Category: true,
        },
        orderBy: { id: 'desc' },
      },
      { page },
    );

    const data = paginateResult.data.map((article) => {
      return {
        id: article.id,
        title: article.title,
        categoryId: article.categoryId,
        subcategory: article.subcategory,
        status: article.status,
        customerId: article.customerId,
        content: article.content,
        videoUrl: article.videoUrl,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        Category: article.Category
          ? {
              id: article.Category?.id,
              name: article.Category?.name,
              subcategory: article.Category?.subcategory,
              icon: article.Category?.icon,
              about: article.Category?.about,
              createdAt: article.Category?.createdAt,
              updatedAt: article.Category?.updatedAt,
            }
          : null,
      };
    }) as ListArticlesOutputDto[];

    return { data, meta: paginateResult.meta };
  }

  async findOne(id: number, customerId: number) {
    const article = await this.prisma.article.findFirst({
      where: {
        id,
        customerId,
      },
      include: {
        Category: true,
      },
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    return article;
  }

  async update(
    id: number,
    updateArticleDto: UpdateArticleDto,
    customerId: number,
  ) {
    const article = await this.prisma.article.findFirst({
      where: {
        id,
        customerId,
      },
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    return this.prisma.article.update({
      where: { id },
      data: updateArticleDto,
    });
  }

  async remove(id: number, customerId: number) {
    const article = await this.prisma.article.findFirst({
      where: {
        id,
        customerId,
      },
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    return this.prisma.article.delete({
      where: { id },
    });
  }
}
