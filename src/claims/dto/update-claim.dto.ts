import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateClaimDto } from './create-claim.dto';

export class UpdateClaimDto extends PartialType(
  OmitType(CreateClaimDto, ['warrantyId'] as const),
) {}