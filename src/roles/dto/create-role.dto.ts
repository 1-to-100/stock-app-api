import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(96)
  name: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
