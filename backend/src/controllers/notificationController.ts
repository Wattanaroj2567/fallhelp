import { Request, Response } from 'express';
import prisma from '../prisma';


// ==========================================
// 📋 List Notifications
// ==========================================
export const listNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const isRead = req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined;

    const skip = (page - 1) * pageSize;

    const where: any = { userId };
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
            }
          }
        }
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
  } catch (error) {
    console.error('Error listing notifications:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ==========================================
// 🔢 Get Unread Count
// ==========================================
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    res.json({ success: true, count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ==========================================
// ✅ Mark as Read
// ==========================================
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
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
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ==========================================
// ✅✅ Mark All as Read
// ==========================================
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
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
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ==========================================
// 🗑️ Delete Notification
// ==========================================
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    await prisma.notification.deleteMany({
      where: {
        id,
        userId, // Ensure ownership
      },
    });

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ==========================================
// 🗑️🗑️ Clear All Notifications
// ==========================================
export const clearAllNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    await prisma.notification.deleteMany({
      where: {
        userId,
      },
    });

    res.json({ success: true, message: 'All notifications cleared' });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
