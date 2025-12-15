import { FeedbackStatus, FeedbackType } from '../generated/prisma/client.js';
import prisma from '../prisma.js';

// ==========================================
// ⚙️ LAYER: Business Logic (Service)
// Purpose: Handle feedback submission and retrieval
// ==========================================

/**
 * Generate next ticket number for repair requests (REP-001, REP-002, etc.)
 */
const generateTicketNumber = async (): Promise<string> => {
  // Get the highest existing ticket number
  const lastTicket = await prisma.feedback.findFirst({
    where: {
      ticketNumber: {
        startsWith: 'REP-',
      },
    },
    orderBy: {
      ticketNumber: 'desc',
    },
    select: {
      ticketNumber: true,
    },
  });

  let nextNumber = 1;
  if (lastTicket?.ticketNumber) {
    const match = lastTicket.ticketNumber.match(/REP-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  // Format as REP-001, REP-002, etc.
  return `REP-${nextNumber.toString().padStart(3, '0')}`;
};

/**
 * Create new feedback
 */
export const createFeedback = async (
  userId: string | null,
  message: string,
  userName?: string,
  type: FeedbackType = 'COMMENT',
) => {
  // Generate ticket number only for repair requests
  const ticketNumber = type === 'REPAIR_REQUEST' ? await generateTicketNumber() : null;

  return prisma.feedback.create({
    data: {
      userId,
      message,
      userName,
      type,
      ticketNumber,
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
          phone: true,
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

/**
 * Get feedbacks for a specific user
 */
export const getUserFeedback = async (userId: string) => {
  return prisma.feedback.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

/**
 * Get repair requests for a specific user (type = REPAIR_REQUEST)
 */
export const getUserRepairRequests = async (userId: string) => {
  return prisma.feedback.findMany({
    where: {
      userId,
      type: 'REPAIR_REQUEST',
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

/**
 * Delete a user's own feedback/repair request
 */
export const deleteUserFeedback = async (feedbackId: string, userId: string) => {
  // First verify the feedback belongs to this user
  const feedback = await prisma.feedback.findFirst({
    where: {
      id: feedbackId,
      userId,
    },
  });

  if (!feedback) {
    return null;
  }

  return prisma.feedback.delete({
    where: { id: feedbackId },
  });
};
