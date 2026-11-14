import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateFeedbackDto } from './create-feedback.dto';

// update e shudhu rating ar comment bodlano jabe.
// repairId ar customerId bad (OmitType), baki optional (PartialType).
export class UpdateFeedbackDto extends PartialType(
  OmitType(CreateFeedbackDto, ['repairId', 'customerId'] as const),
) {}