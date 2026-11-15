import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Galaxy A55', maxLength: 150 })
  name: string;

  @ApiProperty({ example: 'Samsung', maxLength: 100, nullable: true })
  brand: string | null;

  @ApiProperty({ example: 12 })
  warrantyMonths: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ type: 'object', additionalProperties: true })
  category: Record<string, unknown>;

  @ApiProperty({ type: 'object', additionalProperties: true })
  seller: Record<string, unknown>;

  @ApiProperty({ format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt: Date;
}

export class ProductListMetaDto {
  @ApiProperty({ example: 40 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 4 })
  totalPages: number;
}

export class ProductListResponseDto {
  @ApiProperty({ type: [ProductResponseDto] })
  data: ProductResponseDto[];

  @ApiProperty({ type: ProductListMetaDto })
  meta: ProductListMetaDto;
}
