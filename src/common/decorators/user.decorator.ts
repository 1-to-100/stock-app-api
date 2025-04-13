import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FirebaseDecodedToken } from '../types/forebase-decoded-token.type';

export const User = createParamDecorator(
  (
    data: keyof FirebaseDecodedToken | undefined,
    ctx: ExecutionContext,
  ): any => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: FirebaseDecodedToken }>();
    const user = request.user;

    if (!user) return null;
    return data ? user[data] : user;
  },
);

export const UserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user?: FirebaseDecodedToken }>();
    const user = request.user;

    if (!user || typeof user.uid !== 'string') {
      return null;
    }

    return user.uid;
  },
);
