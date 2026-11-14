import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RejectClaimDto {
  @ApiProperty({ example: 'Damage is not covered by the warranty' })
  @IsString()
  @IsNotEmpty() 
  rejectionReason: string;
}