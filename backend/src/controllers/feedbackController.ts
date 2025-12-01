import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorHandler';
import * as feedbackService from '../services/feedbackService';

// ==========================================
// 🎮 LAYER: Controller
// Purpose: Handle HTTP requests for feedback
// ==========================================

export const submitFeedback = asyncHandler(async (req: Request, res: Response) => {
    const { message } = req.body;
    const userId = (req as any).user?.id || null;

    if (!message) {
        res.status(400);
        throw new Error('Message is required');
    }

    const feedback = await feedbackService.createFeedback(userId, message);

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

    const feedback = await feedbackService.updateFeedbackStatus(id, status);

    res.json({
        success: true,
        data: feedback,
    });
});
