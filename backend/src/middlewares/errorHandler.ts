import { Request, Response, NextFunction } from 'express';
import { Prisma } from '../generated/prisma/client.js';
import createDebug from 'debug';
import { AppError } from '../utils/AppError.js';
import { ApiError, ErrorMessages } from '../utils/ApiError.js';

const log = createDebug('fallhelp:error');

/**
 * Global error handler middleware
 * Follows Resend-style error schema pattern
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Log errors
  if (
    (error instanceof AppError && error.isOperational) ||
    (error instanceof ApiError && error.isOperational)
  ) {
    log('[Warn]: %s', error.message);
  } else {
    log('[Error]: %O', error);
  }

  // New ApiError (Thai-friendly)
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.messageTh, // Thai message by default
      },
    });
    return;
  }

  // Legacy AppError (for backward compatibility)
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
    });
    return;
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === 'P2002') {
      res.status(409).json({
        success: false,
        error: {
          code: 'email_already_exists',
          message: ErrorMessages.email_already_exists.th,
        },
      });
      return;
    }

    // Record not found
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: {
          code: 'resource_not_found',
          message: ErrorMessages.resource_not_found.th,
        },
      });
      return;
    }

    // Foreign key constraint failed
    if (error.code === 'P2003') {
      res.status(400).json({
        success: false,
        error: {
          code: 'validation_error',
          message: 'ข้อมูลที่อ้างอิงไม่ถูกต้อง',
        },
      });
      return;
    }
  }

  // Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'validation_error',
        message: ErrorMessages.validation_error.th,
      },
    });
    return;
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: {
        code: 'invalid_token',
        message: ErrorMessages.invalid_token.th,
      },
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: {
        code: 'session_expired',
        message: ErrorMessages.session_expired.th,
      },
    });
    return;
  }

  // Default error (Thai-friendly)
  res.status(500).json({
    success: false,
    error: {
      code: 'internal_server_error',
      message: ErrorMessages.internal_server_error.th,
    },
  });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.path}`,
  });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => unknown) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
