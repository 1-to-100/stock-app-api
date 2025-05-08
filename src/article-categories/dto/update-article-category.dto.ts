import { CreateArticleCategoryDto } from './create-article-category.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateArticleCategoryDto extends PartialType(
  CreateArticleCategoryDto,
) {}
