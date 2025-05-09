import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { PrismaService } from '../prisma/prisma.service';
import { RolesService } from '../roles/roles.service';

@Module({
  controllers: [ArticlesController],
  providers: [ArticlesService, PrismaService, RolesService],
})
export class ArticlesModule {}
