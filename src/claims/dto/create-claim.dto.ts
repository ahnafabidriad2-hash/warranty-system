import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateClaimDto {
  @ApiProperty({
    example: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    description: 'claim in your warrenty product',
  })
  @IsUUID() 
  warrantyId: string;

  @ApiProperty({ example: 'Fridge is not cooling' })
  @IsString()
  @IsNotEmpty() 
  issueDescription: string;
}