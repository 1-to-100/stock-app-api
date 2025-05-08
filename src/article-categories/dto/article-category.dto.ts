import { CreateArticleCategoryDto } from './create-article-category.dto';

export class ArticleCategoryDto extends CreateArticleCategoryDto {
  customerId: number;
  createdBy: number;
}
