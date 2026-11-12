import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class CreateRepairDto {
    @ApiProperty({
        description: 'The approved claim this repair is for ',
        example: '11111111-1111-4111-8111-111111111111',
    })
    @IsUUID()
    claimId: string;

    @ApiProperty({
        description: 'The technician who will do the repairs.',
        example: '22222222-2222-4222-8222-222222222222',
    })
    @IsUUID()
    technicianId: string;

    @ApiPropertyOptional({
        description: 'Any note for the technician',
        example: 'Screen cracked, check the battery too',
    })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    notes?: string;
}

