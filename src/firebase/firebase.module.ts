import { Module } from '@nestjs/common';
import { FirebaseController } from '@/firebase/firebase.controller';

@Module({
  controllers: [FirebaseController],
})
export class FirebaseModule {}
