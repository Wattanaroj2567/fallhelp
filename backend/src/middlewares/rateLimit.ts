import rateLimit from 'express-rate-limit';

/**
 * General API rate limiting
 * Development: 1000 requests per 15 minutes
 * Production: 100 requests per 15 minutes
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: {
    success: false,
    error: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiting for authentication endpoints
 * 50 requests per 15 minutes per IP (relaxed for development)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: {
    success: false,
    error: 'Too many login attempts, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * OTP request rate limiting
 * 3 requests per 10 minutes per IP
 */
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3,
  message: {
    success: false,
    error: 'Too many OTP requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
