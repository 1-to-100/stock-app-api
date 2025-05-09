import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ArticleDto } from './dto/article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { PrismaService } from '../prisma/prisma.service';

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

  async findAll(customerId: number) {
    return this.prisma.article.findMany({
      where: {
        customerId,
      },
      include: {
        Category: true,
      },
    });
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
