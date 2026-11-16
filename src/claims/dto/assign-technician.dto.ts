import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssignTechnicianDto {
  @ApiProperty({ example: '99999999-9999-4999-8999-999999999999' })
  @IsUUID()
  technicianId: string; 
}