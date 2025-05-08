import { Test, TestingModule } from '@nestjs/testing';
import { ArticleCategoriesService } from './article-categories.service';

describe('UsersService', () => {
  let service: ArticleCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArticleCategoriesService],
    }).compile();

    service = module.get<ArticleCategoriesService>(ArticleCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
