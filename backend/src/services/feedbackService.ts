import { Feedback, FeedbackStatus } from '../generated/prisma/client.js';
import prisma from '../prisma.js';

// ==========================================
// ⚙️ LAYER: Business Logic (Service)
// Purpose: Handle feedback submission and retrieval
// ==========================================

/**
 * Create new feedback
 */
export const createFeedback = async (userId: string | null, message: string) => {
    return prisma.feedback.create({
        data: {
            userId,
            message,
        },
    });
};

/**
 * Get all feedbacks (Admin only)
 */
export const getAllFeedbacks = async () => {
    return prisma.feedback.findMany({
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    profileImage: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};

/**
 * Update feedback status (Admin only)
 */
export const updateFeedbackStatus = async (id: string, status: FeedbackStatus) => {
    return prisma.feedback.update({
        where: { id },
        data: { status },
    });
};
