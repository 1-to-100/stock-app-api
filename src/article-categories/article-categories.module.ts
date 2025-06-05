import { Module } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { ArticleCategoriesService } from '@/article-categories/article-categories.service';
import { ArticleCategoriesController } from '@/article-categories/article-categories.controller';
import { AuthService } from '@/auth/auth.service';
import { RolesService } from '@/roles/roles.service';
import { UsersService } from '@/users/users.service';

@Module({
  controllers: [ArticleCategoriesController],
  providers: [
    ArticleCategoriesService,
    PrismaService,
    AuthService,
    RolesService,
    UsersService,
  ],
  exports: [ArticleCategoriesService],
})
export class ArticleCategoriesModule {}
