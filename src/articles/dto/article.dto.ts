import { CreateArticleDto } from './create-article.dto';

export class ArticleDto extends CreateArticleDto {
  customerId: number;
  createdBy: number;
}
