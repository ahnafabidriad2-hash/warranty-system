import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { CreateRepairDto } from './create-repair.dto';
import { RepairStatus } from '../../common/enums/repair-status.enum';

export class UpdateRepairDto extends PartialType(
  OmitType(CreateRepairDto, ['claimId'] as const),
) {
  @ApiPropertyOptional({
    enum: [RepairStatus.ASSIGNED, RepairStatus.IN_PROGRESS],
    description: 'completed / it will take 2 days',
  })
  @IsOptional()
  @IsIn([RepairStatus.ASSIGNED, RepairStatus.IN_PROGRESS])
  status?: RepairStatus;
}