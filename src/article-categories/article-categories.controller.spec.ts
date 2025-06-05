import { Test, TestingModule } from '@nestjs/testing';
import { ArticleCategoriesController } from '@/article-categories/article-categories.controller';
import { ArticleCategoriesService } from '@/article-categories/article-categories.service';

describe('ArticleCategoriesController', () => {
  let controller: ArticleCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticleCategoriesController],
      providers: [ArticleCategoriesService],
    }).compile();

    controller = module.get<ArticleCategoriesController>(
      ArticleCategoriesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
