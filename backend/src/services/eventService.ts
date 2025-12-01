import { EventType, EventSeverity } from '../generated/prisma/client.js';
import { getDateRange } from '../utils/time.js';
import prisma from '../prisma.js';

// ==========================================
// ⚙️ LAYER: Business Logic (Service)
// Purpose: Handle event creation, retrieval, cancellation, and statistics
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
  metadata?: any;
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
  } = {}
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
    throw new Error('Access denied');
  }

  const page = options.page || 1;
  const limit = options.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {
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
    throw new Error('Event not found');
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
    throw new Error('Access denied');
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
    throw new Error('Event not found');
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
    throw new Error('Access denied');
  }

  // Check if event is a fall event
  if (event.type !== 'FALL') {
    throw new Error('Only fall events can be cancelled');
  }

  // Check if already cancelled
  if (event.isCancelled) {
    throw new Error('Event already cancelled');
  }

  // Check if within cancel time window (30 seconds)
  const now = new Date();
  const eventTime = new Date(event.timestamp);
  const diffSeconds = (now.getTime() - eventTime.getTime()) / 1000;

  if (diffSeconds > 30) {
    throw new Error('Cancel time window expired (30 seconds)');
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
 * Get daily event statistics
 */
export const getDailyStats = async (userId: string, elderId: string, days: number = 7) => {
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
    throw new Error('Access denied');
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
  const statsByDate: Record<string, any> = {};

  events.forEach((event) => {
    const date = event.timestamp.toISOString().split('T')[0];

    if (!statsByDate[date]) {
      statsByDate[date] = {
        date,
        total: 0,
        falls: 0,
        cancelledFalls: 0,
        heartRateHigh: 0,
        heartRateLow: 0,
        deviceOffline: 0,
      };
    }

    statsByDate[date].total++;

    if (event.type === 'FALL') {
      statsByDate[date].falls++;
      if (event.isCancelled) {
        statsByDate[date].cancelledFalls++;
      }
    } else if (event.type === 'HEART_RATE_HIGH') {
      statsByDate[date].heartRateHigh++;
    } else if (event.type === 'HEART_RATE_LOW') {
      statsByDate[date].heartRateLow++;
    } else if (event.type === 'DEVICE_OFFLINE') {
      statsByDate[date].deviceOffline++;
    }
  });

  return Object.values(statsByDate).sort((a: any, b: any) =>
    a.date.localeCompare(b.date)
  );
};

/**
 * Get monthly event statistics
 */
export const getMonthlyStats = async (userId: string, elderId: string, year: number, month: number) => {
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
    throw new Error('Access denied');
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

  const stats = {
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
      stats.fallCount++;
      if (event.isCancelled) {
        stats.cancelledFalls++;
      }
    } else if (event.type === 'HEART_RATE_HIGH') {
      stats.heartRateHighCount++;
    } else if (event.type === 'HEART_RATE_LOW') {
      stats.heartRateLowCount++;
    } else if (event.type === 'DEVICE_OFFLINE') {
      stats.deviceOfflineCount++;
    }

    if (event.value && ['HEART_RATE_HIGH', 'HEART_RATE_LOW', 'HEART_RATE_NORMAL'].includes(event.type)) {
      heartRateSum += event.value;
      heartRateCount++;
      heartRates.push(event.value);
    }
  });

  if (heartRateCount > 0) {
    stats.avgHeartRate = Math.round(heartRateSum / heartRateCount);
    stats.maxHeartRate = Math.max(...heartRates);
    stats.minHeartRate = Math.min(...heartRates);
  }

  return stats;
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
