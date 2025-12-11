import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorHandler';
import * as feedbackService from '../services/feedbackService';
import { FeedbackType } from '../generated/prisma/client.js';

// ==========================================
// 🎮 LAYER: Controller
// Purpose: Handle HTTP requests for feedback
// ==========================================

export const submitFeedback = asyncHandler(async (req: Request, res: Response) => {
    const { message, userName, type } = req.body;
    const userId = (req as any).user?.userId || null;

    if (!message) {
        res.status(400);
        throw new Error('Message is required');
    }

    // Validate type if provided
    const feedbackType: FeedbackType = type === 'REPAIR_REQUEST' ? 'REPAIR_REQUEST' : 'COMMENT';

    const feedback = await feedbackService.createFeedback(userId, message, userName, feedbackType);

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

export const getRepairRequests = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId;

    if (!userId) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'unauthorized',
                message: 'Authentication required'
            }
        });
    }

    const repairRequests = await feedbackService.getUserRepairRequests(userId);

    res.json({
        success: true,
        data: repairRequests,
    });
});

export const deleteRepairRequest = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    if (!userId) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'unauthorized',
                message: 'Authentication required'
            }
        });
    }

    const deleted = await feedbackService.deleteUserFeedback(id, userId);

    if (!deleted) {
        return res.status(404).json({
            success: false,
            error: {
                code: 'not_found',
                message: 'Feedback not found or not owned by you'
            }
        });
    }

    res.json({
        success: true,
        data: { id },
    });
});
