import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty({ example: '11111111-1111-4111-8111-111111111111' })
  @IsUUID()
  repairId: string;

  // auth merge howar age porjonto customer body te ashbe.
  // Day 4 e eta muche @CurrentUser() theke nibo.
  @ApiProperty({ example: '33333333-3333-4333-8333-333333333333' })
  @IsUUID()
  customerId: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: 'Fast repair,Ac works fine now' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}