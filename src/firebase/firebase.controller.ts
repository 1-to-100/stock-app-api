import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common';

@Controller('firebase')
export class FirebaseController {
  @Post('sync')
  @HttpCode(204)
  syncUser(
    @Body()
    body: {
      idToken: string;
      email?: string;
      name?: string;
      avatar?: string;
    },
    @Headers('authorization') authHeader: string,
  ) {
    const secret = authHeader?.replace('Bearer ', '');
    if (secret !== process.env.SYNC_SECRET) {
      throw new UnauthorizedException('Invalid secret');
    }

    console.log('syncUser', body);
  }
}
