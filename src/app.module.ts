import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { UsersModule } from '@/users/users.module';
import { PrismaService } from '@/common/prisma/prisma.service';
import { FirebaseModule as LocalFirebaseModule } from '@/firebase/firebase.module';
import { AuthModule } from '@/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SystemModulesModule } from '@/system-modules/system-modules.module';
import { RolesModule } from '@/roles/roles.module';
import { ManagersModule } from '@/managers/managers.module';
import { CustomersModule } from '@/customers/customers.module';
import { TaxonomiesModule } from '@/taxonomies/taxonomies.module';
import { SubscriptionsModule } from '@/subscriptions/subscriptions.module';
import { RegisterModule } from '@/register/register.module';
import { ArticleCategoriesModule } from '@/article-categories/article-categories.module';
import { ArticlesModule } from '@/articles/articles.module';
import { NotificationsModule } from '@/notifications/notifications.module';

@Module({
  imports: [
    UsersModule,
    LocalFirebaseModule,
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    SystemModulesModule,
    RolesModule,
    ManagersModule,
    CustomersModule,
    TaxonomiesModule,
    SubscriptionsModule,
    RegisterModule,
    // ArticlesModule,
    ArticleCategoriesModule,
    ArticlesModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
