import { ApiProperty } from '@nestjs/swagger';

export class WarrantyResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'SN-2026-001', maxLength: 100 })
  serialNumber: string;

  @ApiProperty({ example: '2026-11-15', format: 'date' })
  purchaseDate: string;

  @ApiProperty({ example: '2027-11-15', format: 'date' })
  expiryDate: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ type: 'object', additionalProperties: true })
  product: Record<string, unknown>;

  @ApiProperty({ type: 'object', additionalProperties: true })
  customer: Record<string, unknown>;

  @ApiProperty({ type: 'object', additionalProperties: true })
  seller: Record<string, unknown>;

  @ApiProperty({ format: 'date-time' })
  createdAt: Date;
}

export class WarrantyListMetaDto {
  @ApiProperty({ example: 40 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 4 })
  totalPages: number;
}

export class WarrantyListResponseDto {
  @ApiProperty({ type: [WarrantyResponseDto] })
  data: WarrantyResponseDto[];

  @ApiProperty({ type: WarrantyListMetaDto })
  meta: WarrantyListMetaDto;
}

export class WarrantyValidityResponseDto {
  @ApiProperty({ example: true })
  isValid: boolean;

  @ApiProperty({ example: '2027-11-15', format: 'date' })
  expiryDate: string;
}
