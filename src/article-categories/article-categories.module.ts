import { Module } from '@nestjs/common';
import { ArticleCategoriesService } from './article-categories.service';
import { ArticleCategoriesController } from './article-categories.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { RolesService } from '../roles/roles.service';
import { UsersService } from '../users/users.service';

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
