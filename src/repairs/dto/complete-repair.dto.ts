import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class UsedPartDto {
  @ApiProperty({ example: '44444444-4444-4444-8444-444444444444' })
  @IsUUID()
  partId: string;

  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CompleteRepairDto {
  @ApiProperty({ type: [UsedPartDto] })
  @IsArray()
  @ArrayUnique((p: UsedPartDto) => p.partId)
  @ValidateNested({ each: true })
  @Type(() => UsedPartDto)
  parts: UsedPartDto[];

  // notes: optional, text, max 1000 (CreateRepairDto er moto)
  @ApiPropertyOptional({ example: 'Screen and battery replaced', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}