import { PaginatedInputDto } from '../../common/dto/paginated-input.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class ListArticlesOutputDto extends PaginatedInputDto {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ description: 'Id' })
  id: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Title' })
  title: string;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ description: 'Category ID' })
  categoryId: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Subcategory' })
  subcategory: string;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ description: 'Customer ID' })
  customerId: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Status' })
  status: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Content' })
  content: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Video URL' })
  videoUrl: string;

  @IsDate()
  @IsNotEmpty()
  @ApiProperty({ description: 'Created At' })
  createdAt: Date;

  @IsDate()
  @IsNotEmpty()
  @ApiProperty({ description: 'Created At' })
  updatedAt: Date;

  @IsOptional()
  @ApiPropertyOptional({ description: 'Category Fields' })
  Category: {
    id: number;
    name: string;
    icon: string;
    about: string;
    subcategory: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}
