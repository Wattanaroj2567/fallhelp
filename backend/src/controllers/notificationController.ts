import { Request, Response } from 'express';
import prisma from '../prisma';
import { Prisma } from '../generated/prisma/client.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { createError } from '../utils/ApiError.js';

// ==========================================
// 📋 List Notifications
// ==========================================
export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw createError.accessDenied();
  }

  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;
  const isRead =
    req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined;

  const skip = (page - 1) * pageSize;

  const where: Prisma.NotificationWhereInput = { userId };
  if (isRead !== undefined) {
    where.isRead = isRead;
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      include: {
        event: {
          select: {
            id: true,
            type: true,
            severity: true,
            timestamp: true,
          },
        },
      },
    }),
    prisma.notification.count({ where }),
  ]);

  res.json({
    success: true,
    data: notifications,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
});

// ==========================================
// 🔢 Get Unread Count
// ==========================================
export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw createError.accessDenied();
  }

  const count = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });

  res.json({ success: true, data: { count } });
});

// ==========================================
// ✅ Mark as Read
// ==========================================
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  if (!userId) {
    throw createError.accessDenied();
  }

  await prisma.notification.updateMany({
    where: {
      id,
      userId, // Ensure ownership
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  res.json({ success: true, message: 'Notification marked as read' });
});

// ==========================================
// ✅✅ Mark All as Read
// ==========================================
export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw createError.accessDenied();
  }

  await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  res.json({ success: true, message: 'All notifications marked as read' });
});

// ==========================================
// 🗑️ Delete Notification
// ==========================================
export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  if (!userId) {
    throw createError.accessDenied();
  }

  // Check if exists first? Or just deleteMany is fine?
  // Original code used deleteMany directly which is safe (returns count).
  // But if we want 404 if not found?
  // Original code didn't check. I'll stick to original logic but refactored style.
  // Wait, original code used updateMany/deleteMany.

  await prisma.notification.deleteMany({
    where: {
      id,
      userId, // Ensure ownership
    },
  });

  res.json({ success: true, message: 'Notification deleted' });
});

// ==========================================
// 🗑️🗑️ Clear All Notifications
// ==========================================
export const clearAllNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw createError.accessDenied();
  }

  await prisma.notification.deleteMany({
    where: {
      userId,
    },
  });

  res.json({ success: true, message: 'All notifications cleared' });
});
