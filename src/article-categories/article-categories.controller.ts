import {
  Controller,
  Post,
  Body,
  Logger,
  UseGuards,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { ArticleCategoriesService } from './article-categories.service';
import { CreateArticleCategoryDto } from './dto/create-article-category.dto';
import { UpdateArticleCategoryDto } from './dto/update-article-category.dto';
import { OutputArticleCategoryDto } from './dto/output-article-category.dto';
import { ApiConflictResponse, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import { Permissions } from '../common/decorators/permissions.decorator';
import { PermissionGuard } from '../auth/guards/permission/permission.guard';
import { User } from '../common/decorators/user.decorator';
import { OutputUserDto } from '../users/dto/output-user.dto';
import { CustomerId } from '../common/decorators/customer-id.decorator';
import { ArticleCategoryDto } from './dto/article-category.dto';
import { DynamicAuthGuard } from '../auth/guards/dynamic-auth/dynamic-auth.guard';

@Controller('documents/categories')
@UseGuards(DynamicAuthGuard, PermissionGuard)
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
  @Permissions('Documents:viewCategories')
  async findAll(@User() user: OutputUserDto, @CustomerId() customerId: number) {
    if (!user.isSuperadmin && user.customerId) {
      customerId = user.customerId!;
    }
    if (!customerId) {
      throw new Error('User is not authorized to access this resource');
    }
    return await this.articlesCategoriesService.findAll(customerId);
  }

  @Get('/subcategories')
  @ApiOkResponse({
    description: 'The subcategories list',
  })
  @Permissions('Documents:viewCategories')
  async findAllSubcategories(
    @User() user: OutputUserDto,
    @CustomerId() customerId: number,
  ) {
    if (!user.isSuperadmin && user.customerId) {
      customerId = user.customerId!;
    }
    if (!customerId) {
      throw new Error('User is not authorized to access this resource');
    }
    return await this.articlesCategoriesService.findAllSubcategories(
      customerId,
    );
  }

  @Post()
  @ApiOkResponse({
    description: 'The category record',
    type: OutputArticleCategoryDto,
  })
  @ApiConflictResponse({
    description: 'Error creating category with provided data',
  })
  @Permissions('Documents:createCategories')
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

  @Patch(':id')
  @ApiOkResponse({
    description: 'The updated category record',
    type: OutputArticleCategoryDto,
  })
  @ApiConflictResponse({
    description: 'Error updating category with provided data',
  })
  @ApiParam({ name: 'id', type: Number })
  @Permissions('Documents:editCategories')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @User() user: OutputUserDto,
    @Body() updateArticleCategoryDto: UpdateArticleCategoryDto,
    @CustomerId() customerId: number,
  ) {
    if (!user.isSuperadmin && user.customerId) {
      customerId = user.customerId;
    }
    if (!customerId) {
      throw new Error('User is not authorized to access this resource');
    }
    return await this.articlesCategoriesService.update(
      id,
      updateArticleCategoryDto,
      customerId,
    );
  }

  @Delete(':id')
  @ApiOkResponse({
    description: 'The category has been successfully deleted',
  })
  @ApiParam({ name: 'id', type: Number })
  @Permissions('Documents:deleteCategories')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @User() user: OutputUserDto,
    @CustomerId() customerId: number,
  ) {
    if (!user.isSuperadmin && user.customerId) {
      customerId = user.customerId;
    }
    if (!customerId) {
      throw new Error('User is not authorized to access this resource');
    }
    return await this.articlesCategoriesService.remove(id, customerId);
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'The category record',
    type: OutputArticleCategoryDto,
  })
  @ApiParam({ name: 'id', type: Number })
  @Permissions('Documents:viewCategories')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @User() user: OutputUserDto,
    @CustomerId() customerId: number,
  ) {
    if (!user.isSuperadmin && user.customerId) {
      customerId = user.customerId;
    }
    if (!customerId) {
      throw new Error('User is not authorized to access this resource');
    }
    return await this.articlesCategoriesService.findOne(id, customerId);
  }
}
