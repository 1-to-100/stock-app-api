import { Injectable } from '@nestjs/common';
import { FirebaseAdmin, InjectFirebaseAdmin } from 'nestjs-firebase';

@Injectable()
export class AuthService {
  constructor(
    @InjectFirebaseAdmin() private readonly firebase: FirebaseAdmin,
  ) {}

  async verifyToken(idToken: string) {
    return this.firebase.auth.verifyIdToken(idToken);
  }

  async setUserClaims(uid: string, claims: Record<string, any>) {
    return this.firebase.auth.setCustomUserClaims(uid, claims);
  }

  async getFirebaseUser(uid: string) {
    return this.firebase.auth.getUser(uid);
  }
}
