import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;
}

// Every list endpoint returns its result in this shape.
export function paginate<T>(items: T[], total: number, dto: PaginationDto) {
  return {
    data: items,
    meta: {
      total,
      page: dto.page,
      limit: dto.limit,
      totalPages: Math.ceil(total / dto.limit),
    },
  };
}
