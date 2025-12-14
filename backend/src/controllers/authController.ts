import { Request, Response } from 'express';
import * as authService from '../services/authService';
import { asyncHandler } from '../middlewares/errorHandler';
import { createError } from '../utils/ApiError.js';

// ==========================================
// 🎮 LAYER: Interface (Controller)
// Purpose: Handle authentication requests, validate input, and send responses
// ==========================================

/**
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, phone, role, gender } = req.body;

  const result = await authService.register({
    email,
    password,
    firstName,
    lastName,
    phone,
    role,
    gender,
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: result,
  });
});

/**
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, identifier, password } = req.body;

  // Support both 'email' and 'identifier' fields for backward compatibility
  const loginIdentifier = identifier || email;

  if (!loginIdentifier) {
    throw createError.missingField('Email or Phone number');
  }

  const result = await authService.login(loginIdentifier, password);

  res.json({
    success: true,
    message: 'Login successful',
    data: result,
  });
});

/**
 * POST /api/auth/request-otp
 * For mobile app (CAREGIVER only by default)
 */
export const requestOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, purpose } = req.body;

  const result = await authService.requestOtp(email, purpose); // Default: CAREGIVER only

  res.json({
    success: true,
    data: result,
  });
});

/**
 * POST /api/auth/admin/request-otp
 * For admin panel (ADMIN only)
 */
export const requestAdminOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, purpose } = req.body;

  const result = await authService.requestOtp(email, purpose, 'ADMIN'); // ADMIN only

  res.json({
    success: true,
    data: result,
  });
});

/**
 * POST /api/auth/verify-otp
 */
export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, code, purpose } = req.body;

  const result = await authService.verifyOtp(email, code, purpose);

  res.json({
    success: true,
    data: result,
  });
});

/**
 * POST /api/auth/reset-password
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;

  const result = await authService.resetPassword(email, code, newPassword);

  res.json({
    success: true,
    data: result,
  });
});

/**
 * GET /api/auth/me
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const user = await authService.getProfile(userId);

  res.json({
    success: true,
    data: user,
  });
});
