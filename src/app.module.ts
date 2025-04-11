import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { UsersModule } from './users/users.module';
<<<<<<< HEAD

@Module({
  imports: [UsersModule],
=======
import { FirebaseModule } from './firebase/firebase.module';

@Module({
  imports: [UsersModule, FirebaseModule],
>>>>>>> firebase
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
