import type { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }

  console.error('[Error]', err);
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
