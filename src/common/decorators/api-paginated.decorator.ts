import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

// applyDecorators onek gulo decorator ke ekta te jore.
// Tai controller e shudhu @ApiPaginated() likhlei hoy.
export function ApiPaginated(description: string = 'Paginated list') {
  return applyDecorators(
    ApiOkResponse({
      description: description,
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { type: 'object' },
          },
          meta: {
            type: 'object',
            properties: {
              total: { type: 'number', example: 25 },
              page: { type: 'number', example: 1 },
              limit: { type: 'number', example: 10 },
              totalPages: { type: 'number', example: 3 },
            },
          },
        },
      },
    }),
  );
}