import { NotificationType } from '../generated/prisma/client.js';
import { sendNotification, sendFallAlert, sendHeartRateAlert, sendDeviceOfflineAlert } from '../utils/pushNotification.js';
import prisma from '../prisma.js';

/**
 * Create notification
 */
export const createNotification = async (data: {
  userId: string;
  eventId?: string;
  eventTimestamp?: Date;
  type: NotificationType;
  title: string;
  message: string;
  pushToken?: string;
}) => {
  const notification = await prisma.notification.create({
    data,
  });

  // Send push notification if token provided
  if (data.pushToken) {
    const sent = await sendNotification(data.pushToken, {
      title: data.title,
      body: data.message,
      data: {
        notificationId: notification.id,
        type: data.type,
      },
    });

    // Update notification status
    if (sent) {
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          isSent: true,
          sentAt: new Date(),
        },
      });
    }
  }

  return notification;
};

/**
 * Get user notifications
 */
export const getUserNotifications = async (
  userId: string,
  options: {
    unreadOnly?: boolean;
    page?: number;
    limit?: number;
  } = {}
) => {
  const page = options.page || 1;
  const limit = options.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = { userId };
  if (options.unreadOnly) {
    where.isRead = false;
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Mark notification as read
 */
export const markAsRead = async (userId: string, notificationId: string) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification || notification.userId !== userId) {
    throw new Error('Notification not found');
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (userId: string) => {
  return prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

/**
 * Notify fall detection
 */
export const notifyFallDetection = async (elderId: string, eventId: string, eventTimestamp: Date) => {
  // Get elder info with caregivers
  const elder = await prisma.elder.findUnique({
    where: { id: elderId },
    include: {
      caregivers: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!elder) {
    return;
  }

  const elderName = `${elder.firstName} ${elder.lastName}`;

  // Collect all valid push tokens from caregivers
  const pushTokens = (elder as any).caregivers
    .map((caregiver: any) => caregiver.user.pushToken)
    .filter((token: any): token is string => token !== null && token !== undefined);

  // Send Expo Push Notifications
  if (pushTokens.length > 0) {
    await sendFallAlert(pushTokens, elderName, eventTimestamp);
  }

  // Create notifications for all caregivers
  const notifications = (elder as any).caregivers.map((caregiver: any) =>
    createNotification({
      userId: caregiver.userId,
      eventId,
      eventTimestamp,
      type: 'FALL_DETECTED',
      title: '⚠️ ตรวจพบการหกล้ม',
      message: `${elderName} อาจหกล้ม กรุณาตรวจสอบด่วน!`,
      pushToken: caregiver.user.pushToken || undefined,
    })
  );

  await Promise.all(notifications);
};

/**
 * Notify heart rate alert
 */
export const notifyHeartRateAlert = async (
  elderId: string,
  eventId: string,
  eventTimestamp: Date,
  value: number,
  type: 'HIGH' | 'LOW'
) => {
  const elder = await prisma.elder.findUnique({
    where: { id: elderId },
    include: {
      caregivers: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              pushToken: true,
            },
          },
        },
      },
    },
  });

  if (!elder) {
    return;
  }

  const elderName = `${elder.firstName} ${elder.lastName}`;
  
  // Collect all valid push tokens
  const pushTokens = elder.caregivers
    .map(caregiver => caregiver.user.pushToken)
    .filter((token): token is string => token !== null && token !== undefined);

  if (pushTokens.length > 0) {
    await sendHeartRateAlert(pushTokens, elderName, value, type);
  }

  const notifications = elder.caregivers.map((caregiver) =>
    createNotification({
      userId: caregiver.userId,
      eventId,
      eventTimestamp,
      type: 'HEART_RATE_ALERT',
      title: type === 'HIGH' ? '⚠️ ชีพจรสูงผิดปกติ' : '⚠️ ชีพจรต่ำผิดปกติ',
      message: `${elderName} มีชีพจร ${value} BPM`,
      pushToken: caregiver.user.pushToken || undefined,
    })
  );

  await Promise.all(notifications);
};

/**
 * Notify device offline
 */
export const notifyDeviceOffline = async (elderId: string, eventId: string, eventTimestamp: Date) => {
  const elder = await prisma.elder.findUnique({
    where: { id: elderId },
    include: {
      caregivers: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              pushToken: true,
            },
          },
        },
      },
    },
  });

  if (!elder) {
    return;
  }

  const elderName = `${elder.firstName} ${elder.lastName}`;
  
  // Collect all valid push tokens
  const pushTokens = elder.caregivers
    .map(caregiver => caregiver.user.pushToken)
    .filter((token): token is string => token !== null && token !== undefined);

  if (pushTokens.length > 0) {
    await sendDeviceOfflineAlert(pushTokens, elderName);
  }

  const notifications = elder.caregivers.map((caregiver) =>
    createNotification({
      userId: caregiver.userId,
      eventId,
      eventTimestamp,
      type: 'DEVICE_OFFLINE',
      title: '📱 อุปกรณ์หลุดการเชื่อมต่อ',
      message: `อุปกรณ์ของ ${elderName} ออฟไลน์ อาจเกิดจาก: WiFi หลุด, แบตหมด หรือปิดเครื่อง`,
      pushToken: caregiver.user.pushToken || undefined,
    })
  );

  await Promise.all(notifications);
};

/**
 * Get unread count
 */
export const getUnreadCount = async (userId: string): Promise<number> => {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
};
