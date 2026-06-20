import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { Response } from 'express';

import { randomUUID } from 'crypto';

@Catch()
export class GlobalExceptionFilter
  implements ExceptionFilter
{
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response =
      ctx.getResponse<Response>();

    const flxTraceId = randomUUID();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    let error = {
      code: 'FLX_INTERNAL_ERROR',
      message: 'Erro interno do servidor',
      flxTraceId,
      details: {},
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const exceptionResponse =
        exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        const data = exceptionResponse as any;

        error = {
          code:
            data.code ?? this.getDefaultCode(status),
          message:
            data.message ?? exception.message,
          flxTraceId,
          details: data.details ?? {},
        };
      } else {
        error = {
          code: this.getDefaultCode(status),
          message: String(exceptionResponse),
          flxTraceId,
          details: {},
        };
      }
    }

    response.status(status).json({
      error,
    });
  }

  private getDefaultCode(status: number) {
    switch (status) {
      case 400:
        return 'FLX_VALIDATION_ERROR';

      case 401:
        return 'FLX_UNAUTHORIZED';

      case 403:
        return 'FLX_FORBIDDEN';

      case 404:
        return 'FLX_NOT_FOUND';

      case 409:
        return 'FLX_CONCURRENT_UPDATE';

      default:
        return 'FLX_INTERNAL_ERROR';
    }
  }
}