import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorHandler';
import * as feedbackService from '../services/feedbackService';
import { FeedbackType } from '../generated/prisma/client.js';
import { createError } from '../utils/ApiError.js';

// ==========================================
// 🎮 LAYER: Controller
// Purpose: Handle HTTP requests for feedback
// ==========================================

export const submitFeedback = asyncHandler(async (req: Request, res: Response) => {
  const { message, userName, type, deviceId } = req.body;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.userId || null;

  if (!message) {
    throw createError.missingField('ข้อความ');
  }

  // Validate type if provided
  const feedbackType: FeedbackType = type === 'REPAIR_REQUEST' ? 'REPAIR_REQUEST' : 'COMMENT';

  const feedback = await feedbackService.createFeedback(
    userId,
    message,
    userName,
    feedbackType,
    deviceId,
  );

  res.status(201).json({
    success: true,
    data: feedback,
  });
});

export const getFeedbacks = asyncHandler(async (req: Request, res: Response) => {
  const feedbacks = await feedbackService.getAllFeedbacks();

  res.json({
    success: true,
    data: feedbacks,
  });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    throw createError.missingField('status');
  }

  const feedback = await feedbackService.updateFeedbackStatus(id, status);

  res.json({
    success: true,
    data: feedback,
  });
});

export const getRepairRequests = asyncHandler(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.userId;

  if (!userId) {
    throw createError.accessDenied();
  }

  const repairRequests = await feedbackService.getUserRepairRequests(userId);

  res.json({
    success: true,
    data: repairRequests,
  });
});

export const deleteRepairRequest = asyncHandler(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.userId;
  const { id } = req.params;

  if (!userId) {
    throw createError.accessDenied();
  }

  const deleted = await feedbackService.deleteUserFeedback(id, userId);

  if (!deleted) {
    throw createError.resourceNotFound();
  }

  res.json({
    success: true,
    data: { id },
  });
});
