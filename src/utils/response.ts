import { Response } from 'express';
import { ApiResponse, PaginationMeta } from '../types/index.js';

export function sendSuccess<T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200,
  pagination?: PaginationMeta
): void {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    ...(pagination ? { pagination } : {}),
  };
  res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  message: string = 'Internal Server Error',
  statusCode: number = 500,
  error?: any
): void {
  const response: ApiResponse<null> = {
    success: false,
    message,
    data: null,
    ...(error ? { error } : {}),
  };
  res.status(statusCode).json(response);
}
