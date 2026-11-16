import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateWarrantyDto {
  @ApiProperty({ example: 'SN-2026-001', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  serialNumber: string;

  @ApiProperty({ example: '2026-11-15', format: 'date' })
  @IsDateString()
  purchaseDate: string;

  @ApiProperty({ example: '88888888-8888-4888-8888-888888888888' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: '66666666-6666-4666-8666-666666666666' })
  @IsUUID()
  customerId: string;

  @ApiProperty({ example: '77777777-7777-4777-8777-777777777777' })
  @IsUUID()
  sellerId: string;
}
