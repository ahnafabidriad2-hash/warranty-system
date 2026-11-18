import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Galaxy A55', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({ example: 'Samsung', maxLength: 100, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string | null;

  @ApiProperty({ example: 12, minimum: 1, maximum: 120 })
  @IsInt()
  @Min(1)
  @Max(120)
  warrantyMonths: number;

  @ApiProperty({ example: '88888888-8888-4888-8888-888888888888' })
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional({ example: '77777777-7777-4777-8777-777777777777' })
  @IsOptional()
  @IsUUID()
  sellerId?: string;
}
