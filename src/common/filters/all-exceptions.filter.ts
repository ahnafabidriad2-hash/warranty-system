import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

// Shob error ek format e pathay:
// { statusCode, message, error, path, timestamp }
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Default: kichu bujha na gele 500
    let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      // 1) NotFoundException, ConflictException, validation error...
      statusCode = exception.getStatus();
      const body = exception.getResponse() as {
        message?: string | string[];
        error?: string;
      };
      message = body.message ?? exception.message;
      error = body.error ?? exception.name;
    } else if (exception instanceof QueryFailedError) {
      // 2) MySQL error: 500 er bodole 409 dei
      const code = (exception as QueryFailedError & { code?: string }).code;
      if (code === 'ER_DUP_ENTRY') {
        statusCode = HttpStatus.CONFLICT;
        message = 'This record already exists';
        error = 'Conflict';
      } else if (code === 'ER_ROW_IS_REFERENCED_2') {
        statusCode = HttpStatus.CONFLICT;
        message = 'This record is used somewhere else, so it cannot be deleted';
        error = 'Conflict';
      }
    }

    response.status(statusCode).json({
      statusCode,
      message,
      error,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}