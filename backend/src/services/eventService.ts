import { EventType, EventSeverity, Prisma } from '../generated/prisma/client.js';
import { getDateRange } from '../utils/time.js';
import prisma from '../prisma.js';
import { createError } from '../utils/ApiError.js';

// ==========================================
// ⚙️ LAYER: Business Logic (Service)
// Purpose: Handle event creation, retrieval, cancellation, and summary
// ==========================================

/**
 * Create event from IoT device
 */
export const createEvent = async (data: {
  elderId: string;
  deviceId: string;
  type: EventType;
  severity?: EventSeverity;
  value?: number;
  accelerometerX?: number;
  accelerometerY?: number;
  accelerometerZ?: number;
  gyroscopeX?: number;
  gyroscopeY?: number;
  gyroscopeZ?: number;
  metadata?: Prisma.InputJsonValue;
  timestamp?: Date;
}) => {
  const event = await prisma.event.create({
    data: {
      elderId: data.elderId,
      deviceId: data.deviceId,
      type: data.type,
      severity: data.severity || 'NORMAL',
      value: data.value,
      accelerometerX: data.accelerometerX,
      accelerometerY: data.accelerometerY,
      accelerometerZ: data.accelerometerZ,
      gyroscopeX: data.gyroscopeX,
      gyroscopeY: data.gyroscopeY,
      gyroscopeZ: data.gyroscopeZ,
      metadata: data.metadata,
      timestamp: data.timestamp || new Date(),
    },
    include: {
      elder: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      device: {
        select: {
          id: true,
          deviceCode: true,
          serialNumber: true,
        },
      },
    },
  });

  return event;
};

/**
 * Get events by elder with pagination
 */
export const getEventsByElder = async (
  userId: string,
  elderId: string,
  options: {
    type?: EventType;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  } = {},
) => {
  // Check if user has access to this elder
  const access = await prisma.userElderAccess.findUnique({
    where: {
      userId_elderId: {
        userId,
        elderId,
      },
    },
  });

  if (!access) {
    throw createError.accessDenied();
  }

  const page = options.page || 1;
  const limit = options.limit || 20;
  const skip = (page - 1) * limit;

  const where: Prisma.EventWhereInput = {
    elderId,
  };

  if (options.type) {
    where.type = options.type;
  }

  if (options.startDate || options.endDate) {
    where.timestamp = {};
    if (options.startDate) {
      where.timestamp.gte = options.startDate;
    }
    if (options.endDate) {
      where.timestamp.lte = options.endDate;
    }
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        device: {
          select: {
            deviceCode: true,
            serialNumber: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.event.count({ where }),
  ]);

  return {
    events,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get event by ID
 */
export const getEventById = async (userId: string, eventId: string, timestamp: Date) => {
  const event = await prisma.event.findUnique({
    where: {
      id_timestamp: {
        id: eventId,
        timestamp,
      },
    },
    include: {
      elder: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      device: {
        select: {
          deviceCode: true,
          serialNumber: true,
        },
      },
    },
  });

  if (!event) {
    throw createError.eventNotFound();
  }

  // Check if user has access to this elder
  const access = await prisma.userElderAccess.findUnique({
    where: {
      userId_elderId: {
        userId,
        elderId: event.elderId,
      },
    },
  });

  if (!access) {
    throw createError.accessDenied();
  }

  return event;
};

/**
 * Cancel fall event (within 30 seconds)
 */
export const cancelFallEvent = async (userId: string, eventId: string, timestamp: Date) => {
  const event = await prisma.event.findUnique({
    where: {
      id_timestamp: {
        id: eventId,
        timestamp,
      },
    },
  });

  if (!event) {
    throw createError.eventNotFound();
  }

  // Check if user has access
  const access = await prisma.userElderAccess.findUnique({
    where: {
      userId_elderId: {
        userId,
        elderId: event.elderId,
      },
    },
  });

  if (!access) {
    throw createError.accessDenied();
  }

  // Check if event is a fall event
  if (event.type !== 'FALL') {
    throw createError.invalidEventType();
  }

  // Check if already cancelled
  if (event.isCancelled) {
    throw createError.eventAlreadyCancelled();
  }

  // Check if within cancel time window (30 seconds)
  const now = new Date();
  const eventTime = new Date(event.timestamp);
  const diffSeconds = (now.getTime() - eventTime.getTime()) / 1000;

  if (diffSeconds > 30) {
    throw createError.cancelTimeExpired();
  }

  // Cancel event
  const cancelled = await prisma.event.update({
    where: {
      id_timestamp: {
        id: eventId,
        timestamp,
      },
    },
    data: {
      isCancelled: true,
      cancelledAt: now,
    },
  });

  return cancelled;
};

/**
 * Get daily event summary
 */
export const getDailySummary = async (userId: string, elderId: string, days: number = 7) => {
  // Check access
  const access = await prisma.userElderAccess.findUnique({
    where: {
      userId_elderId: {
        userId,
        elderId,
      },
    },
  });

  if (!access) {
    throw createError.accessDenied();
  }

  const { start, end } = getDateRange(days);

  const events = await prisma.event.findMany({
    where: {
      elderId,
      timestamp: {
        gte: start,
        lte: end,
      },
    },
    select: {
      type: true,
      severity: true,
      timestamp: true,
      isCancelled: true,
    },
  });

  // Group by date
  const summaryByDate: Record<
    string,
    {
      date: string;
      total: number;
      falls: number;
      cancelledFalls: number;
      heartRateHigh: number;
      heartRateLow: number;
      deviceOffline: number;
    }
  > = {};

  events.forEach((event) => {
    const date = event.timestamp.toISOString().split('T')[0];

    if (!summaryByDate[date]) {
      summaryByDate[date] = {
        date,
        total: 0,
        falls: 0,
        cancelledFalls: 0,
        heartRateHigh: 0,
        heartRateLow: 0,
        deviceOffline: 0,
      };
    }

    summaryByDate[date].total++;

    if (event.type === 'FALL') {
      summaryByDate[date].falls++;
      if (event.isCancelled) {
        summaryByDate[date].cancelledFalls++;
      }
    } else if (event.type === 'HEART_RATE_HIGH') {
      summaryByDate[date].heartRateHigh++;
    } else if (event.type === 'HEART_RATE_LOW') {
      summaryByDate[date].heartRateLow++;
    } else if (event.type === 'DEVICE_OFFLINE') {
      summaryByDate[date].deviceOffline++;
    }
  });

  return Object.values(summaryByDate).sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Get monthly event summary
 */
export const getMonthlySummary = async (
  userId: string,
  elderId: string,
  year: number,
  month: number,
) => {
  // Check access
  const access = await prisma.userElderAccess.findUnique({
    where: {
      userId_elderId: {
        userId,
        elderId,
      },
    },
  });

  if (!access) {
    throw createError.accessDenied();
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const events = await prisma.event.findMany({
    where: {
      elderId,
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const summary = {
    year,
    month,
    totalEvents: events.length,
    fallCount: 0,
    cancelledFalls: 0,
    heartRateHighCount: 0,
    heartRateLowCount: 0,
    deviceOfflineCount: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    minHeartRate: 0,
  };

  let heartRateSum = 0;
  let heartRateCount = 0;
  const heartRates: number[] = [];

  events.forEach((event) => {
    if (event.type === 'FALL') {
      summary.fallCount++;
      if (event.isCancelled) {
        summary.cancelledFalls++;
      }
    } else if (event.type === 'HEART_RATE_HIGH') {
      summary.heartRateHighCount++;
    } else if (event.type === 'HEART_RATE_LOW') {
      summary.heartRateLowCount++;
    } else if (event.type === 'DEVICE_OFFLINE') {
      summary.deviceOfflineCount++;
    }

    if (
      event.value &&
      ['HEART_RATE_HIGH', 'HEART_RATE_LOW', 'HEART_RATE_NORMAL'].includes(event.type)
    ) {
      heartRateSum += event.value;
      heartRateCount++;
      heartRates.push(event.value);
    }
  });

  if (heartRateCount > 0) {
    summary.avgHeartRate = Math.round(heartRateSum / heartRateCount);
    summary.maxHeartRate = Math.max(...heartRates);
    summary.minHeartRate = Math.min(...heartRates);
  }

  return summary;
};

/**
 * Get recent events for dashboard
 */
export const getRecentEvents = async (userId: string, limit: number = 10) => {
  // Get all elders user has access to
  const accesses = await prisma.userElderAccess.findMany({
    where: { userId },
    select: { elderId: true },
  });

  const elderIds = accesses.map((a) => a.elderId);

  if (elderIds.length === 0) {
    return [];
  }

  const events = await prisma.event.findMany({
    where: {
      elderId: {
        in: elderIds,
      },
    },
    include: {
      elder: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
        },
      },
      device: {
        select: {
          deviceCode: true,
        },
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
    take: limit,
  });

  return events;
};
