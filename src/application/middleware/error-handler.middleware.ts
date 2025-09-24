import { Request, Response, NextFunction } from 'express';

import { NotFoundError } from '@/domain/errors/not-found.error';

export interface ErrorResponse {
  error: string;
  message: string;
  code?: string;
  statusCode: number;
}

export const errorHandlerMiddleware = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error('Error caught by middleware:', error);

  let errorResponse: ErrorResponse;

  if (error instanceof NotFoundError) {
    errorResponse = {
      error: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode
    };
  } else {
    errorResponse = {
      error: 'Internal Server Error',
      message: error.message || 'An unexpected error occurred',
      statusCode: 500
    };
  }

  res.status(errorResponse.statusCode).json({
    error: errorResponse.error,
    message: errorResponse.message,
    ...(errorResponse.code && { code: errorResponse.code })
  });
};
