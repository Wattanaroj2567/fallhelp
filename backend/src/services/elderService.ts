import { Elder, AccessLevel } from '../generated/prisma/client.js';
import prisma from '../prisma.js';

// ==========================================
// ⚙️ LAYER: Business Logic (Service)
// Purpose: Handle elder profile management, access control, and member invitations
// ==========================================

/**
 * Create elder (Owner will be the creator)
 */
export const createElder = async (
  userId: string,
  data: {
    firstName: string;
    lastName: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    dateOfBirth?: Date;
    height?: number;
    weight?: number;
    diseases?: string[];
    address?: string;
    bloodType?: string;
    allergies?: string[];
    medications?: string[];
    profileImage?: string;
  }
) => {
  const elder = await prisma.elder.create({
    data: {
      ...data,
      caregivers: {
        create: {
          userId,
          accessLevel: 'OWNER', // Creator is always OWNER
        },
      },
    },
    include: {
      device: true,
      caregivers: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          },
        },
      },
    },
  });

  return elder;
};

/**
 * Get elders by user (only active elders)
 */
export const getEldersByUser = async (userId: string) => {
  const elders = await prisma.elder.findMany({
    where: {
      caregivers: {
        some: {
          userId,
        },
      },
      isActive: true,
    },
    include: {
      device: {
        include: {
          config: true,
        },
      },
      caregivers: {
        where: {
          userId,
        },
        select: {
          accessLevel: true,
        },
      },
      _count: {
        select: {
          emergencyContacts: true,
          events: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return elders.map((elder) => ({
    ...elder,
    accessLevel: elder.caregivers[0]?.accessLevel || 'VIEWER',
    caregivers: undefined,
  }));
};

/**
 * Get elder by ID (with access check)
 */
export const getElderById = async (userId: string, elderId: string) => {
  const elder = await prisma.elder.findFirst({
    where: {
      id: elderId,
      caregivers: {
        some: {
          userId,
        },
      },
      isActive: true,
    },
    include: {
      device: {
        include: {
          config: true,
        },
      },
      caregivers: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          },
        },
      },
      emergencyContacts: {
        where: {

        },
        orderBy: {
          priority: 'asc',
        },
      },
    },
  });

  if (!elder) {
    throw new Error('Elder not found or access denied');
  }

  // Get user's access level
  const userAccess = elder.caregivers.find((c) => c.userId === userId);

  return {
    ...elder,
    accessLevel: userAccess?.accessLevel || 'VIEWER',
  };
};

/**
 * Update elder (only OWNER can update)
 */
export const updateElder = async (
  userId: string,
  elderId: string,
  data: Partial<Elder>
) => {
  // Check access level
  const access = await prisma.userElderAccess.findUnique({
    where: {
      userId_elderId: {
        userId,
        elderId,
      },
    },
  });

  if (!access || access.accessLevel !== 'OWNER') {
    throw new Error('Only owner can update elder information');
  }

  const elder = await prisma.elder.update({
    where: { id: elderId },
    data,
    include: {
      device: true,
      emergencyContacts: {

        orderBy: { priority: 'asc' },
      },
    },
  });

  return elder;
};

/**
 * Soft delete elder (only OWNER can deactivate)
 */
export const deactivateElder = async (userId: string, elderId: string) => {
  // Check access level
  const access = await prisma.userElderAccess.findUnique({
    where: {
      userId_elderId: {
        userId,
        elderId,
      },
    },
  });

  if (!access || access.accessLevel !== 'OWNER') {
    throw new Error('Only owner can deactivate elder');
  }

  const elder = await prisma.elder.update({
    where: { id: elderId },
    data: { isActive: false },
  });

  return {
    message: 'Elder deactivated successfully',
    elder,
  };
};

/**
 * Hard delete elder (only OWNER can delete)
 */
export const deleteElder = async (userId: string, elderId: string) => {
  // Check access level
  const access = await prisma.userElderAccess.findUnique({
    where: {
      userId_elderId: {
        userId,
        elderId,
      },
    },
  });

  if (!access || access.accessLevel !== 'OWNER') {
    throw new Error('Only owner can delete elder');
  }

  // Delete elder (Cascade delete will handle related records if configured in schema, otherwise might need manual cleanup)
  // Assuming Prisma schema has onDelete: Cascade for relations
  await prisma.elder.delete({
    where: { id: elderId },
  });

  return {
    message: 'Elder deleted successfully',
  };
};

/**
 * Invite member (only OWNER can invite)
 */
export const inviteMember = async (
  userId: string,
  elderId: string,
  inviteeEmail: string
) => {
  // Check if requester is OWNER
  const access = await prisma.userElderAccess.findUnique({
    where: {
      userId_elderId: {
        userId,
        elderId,
      },
    },
  });

  if (!access || access.accessLevel !== 'OWNER') {
    throw new Error('Only owner can invite members');
  }

  // Find invitee user
  const inviteeUser = await prisma.user.findUnique({
    where: { email: inviteeEmail },
  });

  if (!inviteeUser) {
    throw new Error('User not found');
  }

  // Check if already has access
  const existingAccess = await prisma.userElderAccess.findUnique({
    where: {
      userId_elderId: {
        userId: inviteeUser.id,
        elderId,
      },
    },
  });

  if (existingAccess) {
    throw new Error('User already has access to this elder');
  }

  // Grant VIEWER access
  const newAccess = await prisma.userElderAccess.create({
    data: {
      userId: inviteeUser.id,
      elderId,
      accessLevel: 'VIEWER',
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          profileImage: true,
        },
      },
    },
  });

  return newAccess;
};

/**
 * Remove member (only OWNER can remove)
 */
export const removeMember = async (
  userId: string,
  elderId: string,
  memberUserId: string
) => {
  // Check if requester is OWNER
  const access = await prisma.userElderAccess.findUnique({
    where: {
      userId_elderId: {
        userId,
        elderId,
      },
    },
  });

  if (!access || access.accessLevel !== 'OWNER') {
    throw new Error('Only owner can remove members');
  }

  // Cannot remove self
  if (memberUserId === userId) {
    throw new Error('Cannot remove yourself');
  }

  // Check if member is also OWNER (cannot remove other owners)
  const memberAccess = await prisma.userElderAccess.findUnique({
    where: {
      userId_elderId: {
        userId: memberUserId,
        elderId,
      },
    },
  });

  if (memberAccess?.accessLevel === 'OWNER') {
    throw new Error('Cannot remove owner');
  }

  await prisma.userElderAccess.delete({
    where: {
      userId_elderId: {
        userId: memberUserId,
        elderId,
      },
    },
  });

  return {
    message: 'Member removed successfully',
  };
};

/**
 * Get elder members
 */
export const getElderMembers = async (userId: string, elderId: string) => {
  // Check access
  const hasAccess = await prisma.userElderAccess.findUnique({
    where: {
      userId_elderId: {
        userId,
        elderId,
      },
    },
  });

  if (!hasAccess) {
    throw new Error('Access denied');
  }

  const members = await prisma.userElderAccess.findMany({
    where: { elderId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          profileImage: true,
        },
      },
    },
    orderBy: {
      grantedAt: 'asc',
    },
  });

  return members;
};
