import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class CheckUserExistsDto {
  @IsEmail()
  @ApiProperty({ description: 'Email address' })
  email: string;
}
