import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { UsersModule } from './users/users.module';
import { FirebaseModule as LocalFirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';
import { FirebaseModule } from 'nestjs-firebase';

const config = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
};

@Module({
  imports: [
    UsersModule,
    LocalFirebaseModule,
    AuthModule,
    FirebaseModule.forRoot({
      googleApplicationCredential: {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
