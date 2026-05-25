import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    res.status(409).json({
      success: false,
      message: 'A record with this value already exists.',
    });
    return;
  }

  if (err.name === 'SequelizeValidationError') {
    res.status(400).json({
      success: false,
      message: 'Validation error.',
      errors: (err as { errors?: { message: string }[] }).errors?.map(
        (e) => e.message
      ),
    });
    return;
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    res.status(409).json({
      success: false,
      message: 'Cannot perform this operation due to related records.',
    });
    return;
  }

  if (err.name === 'SequelizeDatabaseError') {
    res.status(400).json({
      success: false,
      message: 'Database error occurred.',
    });
    return;
  }

  console.error('[Unhandled Error]', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error.',
  });
};

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`,
  });
};
