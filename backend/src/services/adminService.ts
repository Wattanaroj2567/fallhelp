import prisma from '../prisma.js';
import * as deviceService from './deviceService.js';

// ==========================================
// ⚙️ LAYER: Business Logic (Service)
// Purpose: Handle admin dashboard statistics and system-wide data retrieval
// ==========================================

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  const [
    totalUsers,
    activeUsers,
    totalDevices,
    activeDevices,
    totalElders,
    activeElders,
    todayEvents,
    todayFalls,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.device.count(),
    prisma.device.count({ where: { status: 'ACTIVE' } }),
    prisma.elder.count(),
    prisma.elder.count({ where: { isActive: true } }),
    prisma.event.count({
      where: {
        timestamp: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.event.count({
      where: {
        type: 'FALL',
        timestamp: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ]);

  return {
    totalUsers,
    activeUsers,
    totalDevices,
    activeDevices,
    totalElders,
    activeElders,
    todayEvents,
    todayFalls,
  };
};

/**
 * Get all users (Admin only)
 */
export const getAllUsers = async (options: {
  page?: number;
  limit?: number;
  search?: string;
} = {}) => {
  const page = options.page || 1;
  const limit = options.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (options.search) {
    where.OR = [
      { email: { contains: options.search, mode: 'insensitive' } },
      { firstName: { contains: options.search, mode: 'insensitive' } },
      { lastName: { contains: options.search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            elders: true,
            notifications: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get all elders (Admin only)
 */
export const getAllElders = async (options: {
  page?: number;
  limit?: number;
  includeInactive?: boolean;
} = {}) => {
  const page = options.page || 1;
  const limit = options.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (!options.includeInactive) {
    where.isActive = true;
  }

  const [elders, total] = await Promise.all([
    prisma.elder.findMany({
      where,
      include: {
        device: {
          select: {
            id: true,
            deviceCode: true,
            status: true,
            lastOnline: true,
          },
        },
        caregivers: {
          select: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            caregivers: true,
            events: true,
            emergencyContacts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.elder.count({ where }),
  ]);

  return {
    elders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Create device (Admin only)
 */
export const createDevice = async (data: {
  serialNumber: string;
  firmwareVersion?: string;
}) => {
  return deviceService.createDevice(data);
};

/**
 * Get all devices (Admin only)
 */
export const getAllDevices = async () => {
  return deviceService.getAllDevices();
};

/**
 * Delete device (Admin only)
 */
export const deleteDevice = async (id: string) => {
  // Check if device exists and is paired
  const device = await prisma.device.findUnique({
    where: { id },
    include: { elder: true },
  });

  if (!device) {
    throw new Error('Device not found');
  }

  if (device.status === 'PAIRED' || device.elderId) {
    throw new Error('Cannot delete device that is currently paired with an elder. Please unpair it first.');
  }

  return prisma.device.delete({
    where: { id },
  });
};

/**
 * Get system events (Admin only)
 */
export const getSystemEvents = async (options: {
  page?: number;
  limit?: number;
  type?: string;
  severity?: string;
} = {}) => {
  const page = options.page || 1;
  const limit = options.limit || 50;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (options.type) {
    where.type = options.type;
  }
  if (options.severity) {
    where.severity = options.severity;
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
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
 * Get event statistics for admin
 */
export const getEventStatistics = async (days: number = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const events = await prisma.event.findMany({
    where: {
      timestamp: {
        gte: startDate,
      },
    },
    select: {
      type: true,
      severity: true,
      timestamp: true,
      isCancelled: true,
    },
  });

  const stats = {
    totalEvents: events.length,
    fallCount: 0,
    cancelledFalls: 0,
    heartRateHighCount: 0,
    heartRateLowCount: 0,
    deviceOfflineCount: 0,
    criticalEvents: 0,
    warningEvents: 0,
  };

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

    if (event.severity === 'CRITICAL') {
      stats.criticalEvents++;
    } else if (event.severity === 'WARNING') {
      stats.warningEvents++;
    }
  });

  return stats;
};
