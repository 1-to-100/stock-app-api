import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseAdmin, InjectFirebaseAdmin } from 'nestjs-firebase';
import { OutputArticleCategoryDto } from './dto/output-article-category.dto';
import { ArticleCategoryDto } from './dto/article-category.dto';
import { UpdateArticleCategoryDto } from './dto/update-article-category.dto';

@Injectable()
export class ArticleCategoriesService {
  private readonly logger = new Logger(ArticleCategoriesService.name);

  constructor(
    @InjectFirebaseAdmin() private readonly firebase: FirebaseAdmin,
    private readonly prisma: PrismaService,
  ) {}
  async create(
    createArticleCategoryDto: ArticleCategoryDto,
  ): Promise<OutputArticleCategoryDto> {
    try {
      this.logger.log(
        `Create category with name ${createArticleCategoryDto.name}`,
      );
      const category = await this.prisma.articleCategory.create({
        data: createArticleCategoryDto,
      });
      return category as OutputArticleCategoryDto;
    } catch (error) {
      this.logger.error(`Error creating category: ${error}`);
      throw new ConflictException('Category cannot be created.');
    }
  }

  async findAll(customerId: number): Promise<OutputArticleCategoryDto[]> {
    const categories = await this.prisma.articleCategory.findMany({
      where: { customerId },
      include: {
        _count: {
          select: {
            Articles: true,
          },
        },
      },
    });
    this.logger.log(`Find all categories for customer ${customerId}`);
    return categories;
  }

  async findAllSubcategories(customerId: number) {
    const categories = await this.prisma.articleCategory.findMany({
      where: {
        customerId,
        subcategory: {
          not: null,
        },
      },
      select: { subcategory: true },
      distinct: ['subcategory'],
      orderBy: { subcategory: 'asc' },
    });
    this.logger.log(`Find all categories for customer ${customerId}`);
    return categories.map((category) => category.subcategory as string);
  }

  async update(
    id: number,
    updateArticleCategoryDto: UpdateArticleCategoryDto,
    customerId: number,
  ): Promise<OutputArticleCategoryDto> {
    try {
      this.logger.log(
        `Update category ${id} with data: ${JSON.stringify(updateArticleCategoryDto)}`,
      );
      const category = await this.prisma.articleCategory.update({
        where: { id, customerId },
        data: updateArticleCategoryDto,
      });
      return category as OutputArticleCategoryDto;
    } catch (error) {
      this.logger.error(`Error updating category: ${error}`);
      throw new ConflictException('Category cannot be updated.');
    }
  }

  async remove(id: number, customerId: number) {
    try {
      this.logger.log(`Delete category ${id} for customer ${customerId}`);
      await this.prisma.articleCategory.delete({
        where: {
          id,
          customerId,
        },
      });
      return true;
    } catch (error) {
      this.logger.error(`Error deleting category: ${error}`);
      throw new ConflictException('Category cannot be deleted.');
    }
  }
}
