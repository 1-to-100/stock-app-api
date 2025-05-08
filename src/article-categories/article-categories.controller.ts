import { Controller, Post, Body, Logger, UseGuards, Get } from '@nestjs/common';
import { ArticleCategoriesService } from './article-categories.service';
import { CreateArticleCategoryDto } from './dto/create-article-category.dto';
import { OutputArticleCategoryDto } from './dto/output-article-category.dto';
import { ApiConflictResponse, ApiOkResponse } from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth/firebase-auth.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { PermissionGuard } from '../auth/guards/permission/permission.guard';
import { User } from '../common/decorators/user.decorator';
import { OutputUserDto } from '../users/dto/output-user.dto';
import { CustomerId } from '../common/decorators/customer-id.decorator';
import { ArticleCategoryDto } from './dto/article-category.dto';

@Controller('documents/categories')
@UseGuards(FirebaseAuthGuard, PermissionGuard)
export class ArticleCategoriesController {
  private readonly logger = new Logger(ArticleCategoriesController.name);
  constructor(
    private readonly articlesCategoriesService: ArticleCategoriesService,
  ) {}

  @Get()
  @ApiOkResponse({
    description: 'The categories list',
    type: OutputArticleCategoryDto,
  })
  @ApiConflictResponse({
    description: 'Error creating category with provided data',
  })
  @Permissions('UserManagement:createUser')
  async findAll(
    @User() user: OutputUserDto,
    @Body() createArticleCategoryDto: CreateArticleCategoryDto,
    @CustomerId() customerId: number,
  ) {
    if (!user.isSuperadmin && user.customerId) {
      customerId = user.customerId!;
    }
    return await this.articlesCategoriesService.findAll(customerId);
  }

  @Post()
  @ApiOkResponse({
    description: 'The category record',
    type: OutputArticleCategoryDto,
  })
  @ApiConflictResponse({
    description: 'Error creating category with provided data',
  })
  @Permissions('UserManagement:createUser')
  async create(
    @User() user: OutputUserDto,
    @Body() createArticleCategoryDto: CreateArticleCategoryDto,
    @CustomerId() customerId: number,
  ) {
    const fields: ArticleCategoryDto = {
      name: createArticleCategoryDto.name,
      about: createArticleCategoryDto.about,
      subcategory: createArticleCategoryDto.subcategory,
      customerId: user.customerId!,
      createdBy: user.id,
      icon: createArticleCategoryDto.icon,
    };
    if (!user.isSuperadmin && user.customerId) {
      fields.customerId = user.customerId;
    } else {
      fields.customerId = customerId;
    }
    return await this.articlesCategoriesService.create(fields);
  }
}
