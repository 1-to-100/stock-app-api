import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Logger,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { PermissionGuard } from '../auth/guards/permission/permission.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { User } from '../common/decorators/user.decorator';
import { OutputUserDto } from '../users/dto/output-user.dto';
import { CustomerId } from '../common/decorators/customer-id.decorator';
import { ApiOkResponse, ApiConflictResponse, ApiParam } from '@nestjs/swagger';
import { ArticleDto } from './dto/article.dto';
import { DynamicAuthGuard } from '../auth/guards/dynamic-auth/dynamic-auth.guard';

@Controller('documents/articles')
@UseGuards(DynamicAuthGuard, PermissionGuard)
export class ArticlesController {
  private readonly logger = new Logger(ArticlesController.name);

  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @ApiOkResponse({ description: 'The article has been created' })
  @ApiConflictResponse({
    description: 'Error creating article with provided data',
  })
  @Permissions('Documents:createArticles')
  async create(
    @User() user: OutputUserDto,
    @Body() createArticleDto: CreateArticleDto,
    @CustomerId() customerId: number,
  ) {
    if (!user.isSuperadmin && user.customerId) {
      customerId = user.customerId;
    }
    if (!customerId) {
      throw new Error('User is not authorized to access this resource');
    }
    const fields: ArticleDto = {
      ...createArticleDto,
      customerId,
      createdBy: user.id,
    };
    return await this.articlesService.create(fields);
  }

  @Get()
  @ApiOkResponse({ description: 'The articles list' })
  @Permissions('Documents:viewArticles')
  async findAll(@User() user: OutputUserDto, @CustomerId() customerId: number) {
    if (!user.isSuperadmin && user.customerId) {
      customerId = user.customerId;
    }
    if (!customerId) {
      throw new Error('User is not authorized to access this resource');
    }
    return await this.articlesService.findAll(customerId);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'The article record' })
  @ApiParam({ name: 'id', type: Number })
  @Permissions('Documents:viewArticles')
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
    return await this.articlesService.findOne(id, customerId);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'The article has been updated' })
  @ApiConflictResponse({
    description: 'Error updating article with provided data',
  })
  @ApiParam({ name: 'id', type: Number })
  @Permissions('Documents:editArticles')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateArticleDto: UpdateArticleDto,
    @User() user: OutputUserDto,
    @CustomerId() customerId: number,
  ) {
    if (!user.isSuperadmin && user.customerId) {
      customerId = user.customerId;
    }
    if (!customerId) {
      throw new Error('User is not authorized to access this resource');
    }
    return await this.articlesService.update(id, updateArticleDto, customerId);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'The article has been deleted' })
  @ApiParam({ name: 'id', type: Number })
  @Permissions('Documents:deleteArticles')
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
    return await this.articlesService.remove(id, customerId);
  }
}
