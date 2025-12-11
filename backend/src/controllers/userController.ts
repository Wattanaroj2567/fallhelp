import { Request, Response } from 'express';
import * as userService from '../services/userService';
import { asyncHandler } from '../middlewares/errorHandler';

// ==========================================
// 🎮 LAYER: Interface (Controller)
// Purpose: Handle user management requests
// ==========================================

/**
 * GET /api/users/profile
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const user = await userService.getUserProfile(userId);

  res.json({
    success: true,
    data: user,
  });
});

/**
 * PUT /api/users/profile
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { firstName, lastName, phone, profileImage, gender } = req.body;

  const user = await userService.updateUserProfile(userId, {
    firstName,
    lastName,
    phone,
    profileImage,
    gender,
  });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: user,
  });
});

/**
 * PUT /api/users/password
 */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { currentPassword, newPassword } = req.body;

  const result = await userService.changePassword(userId, currentPassword, newPassword);

  res.json({
    success: true,
    data: result,
  });
});

/**
 * GET /api/users/elders
 */
export const getUserElders = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const elders = await userService.getUserElders(userId);

  res.json({
    success: true,
    data: elders,
  });
});

/**
 * PUT /api/users/push-token
 */
export const updatePushToken = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { pushToken } = req.body;

  const result = await userService.updatePushToken(userId, pushToken);

  res.json({
    success: true,
    data: result,
  });
});

/**
 * DELETE /api/users/me
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const result = await userService.deleteUser(userId);

  res.json({
    success: true,
    data: result,
  });
});

/**
 * GET /api/users/feedback
 */
export const getUserFeedback = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  // Import feedbackService at the top if not already done
  const feedbackService = await import('../services/feedbackService');
  const feedbacks = await feedbackService.getUserFeedback(userId);

  res.json({
    success: true,
    data: feedbacks,
  });
});
