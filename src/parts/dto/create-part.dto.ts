import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class CreatePartDto {
  @ApiProperty({ example: 'Compressor motor' })
  @IsString() 
  @IsNotEmpty() 
  name: string;

  @ApiProperty({ example: 'CMP-001' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: 25 })
  @IsInt() 
  @Min(0) 
  stock: number;

  @ApiProperty({ example: 49.99 })
  @IsNumber({ maxDecimalPlaces: 2 }) 
  @Min(0)
  unitPrice: number;
}