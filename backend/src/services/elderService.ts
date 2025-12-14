import { Elder, AccessLevel } from '../generated/prisma/client.js';
import prisma from '../prisma.js';
import { sendInvitationEmail } from '../utils/email.js';
import { ApiError, createError } from '../utils/ApiError.js';

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
    dateOfBirth?: Date | string;
    height?: number;
    weight?: number;
    diseases?: string[];
    bloodType?: string;
    allergies?: string[];
    medications?: string[];
    profileImage?: string;
    // Address fields (separated)
    houseNumber?: string;
    village?: string;
    subdistrict?: string;
    district?: string;
    province?: string;
    zipcode?: string;
  }
) => {
  // Convert dateOfBirth string to Date if needed
  const processedData = {
    ...data,
    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
  };

  const elder = await prisma.elder.create({
    data: {
      ...processedData,
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

  return elders.map((elder) => {
    // Convert dateOfBirth to Buddhist Era (BE) by adding 543 years
    let dateOfBirthBE = elder.dateOfBirth;
    if (elder.dateOfBirth) {
      const date = new Date(elder.dateOfBirth);
      date.setFullYear(date.getFullYear() + 543);
      dateOfBirthBE = date;
    }

    return {
      ...elder,
      dateOfBirth: dateOfBirthBE,
      accessLevel: elder.caregivers[0]?.accessLevel || 'VIEWER',
      caregivers: undefined,
    };
  });
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
    throw createError.elderNotFound();
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
  data: {
    firstName?: string;
    lastName?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    dateOfBirth?: Date | string;
    height?: number;
    weight?: number;
    diseases?: string[];
    bloodType?: string;
    allergies?: string[];
    medications?: string[];
    profileImage?: string;
    // Address fields (separated)
    houseNumber?: string;
    village?: string;
    subdistrict?: string;
    district?: string;
    province?: string;
    zipcode?: string;
  }
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

  if (!access || (access.accessLevel !== 'OWNER' && access.accessLevel !== 'EDITOR')) {
    throw createError.editorRequired();
  }

  // Convert dateOfBirth string to Date if needed
  const processedData = {
    ...data,
    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
  };

  const elder = await prisma.elder.update({
    where: { id: elderId },
    data: processedData,
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
    throw createError.ownerOnly();
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
    throw createError.ownerOnly();
  }

  // Delete elder (Cascade delete will handle related records if configured in schema, otherwise might need manual cleanup)
  // Assuming Prisma schema has onDelete: Cascade for relations
  try {
    await prisma.elder.delete({
      where: { id: elderId },
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      // Record already deleted, consider it a success
      return {
        message: 'Elder deleted successfully (already deleted)',
      };
    }
    throw error;
  }

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
    throw createError.ownerOnly();
  }

  // Find invitee user
  const inviteeUser = await prisma.user.findUnique({
    where: { email: inviteeEmail },
  });

  if (!inviteeUser) {
    throw new ApiError('user_not_found', 'ไม่พบผู้ใช้งานที่มีอีเมลนี้ กรุณาตรวจสอบอีเมลอีกครั้ง หรือผู้ใช้ยังไม่ได้ลงทะเบียน');
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
    throw new ApiError('user_already_member');
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

  // Get inviter (requester) and elder info for email
  const inviter = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true },
  });

  const elder = await prisma.elder.findUnique({
    where: { id: elderId },
    select: { firstName: true, lastName: true },
  });

  if (inviter && elder) {
    const inviterName = `${inviter.firstName} ${inviter.lastName}`;
    const elderName = `${elder.firstName} ${elder.lastName}`;

    // Fire and forget email (don't block response)
    sendInvitationEmail(inviteeEmail, inviterName, elderName).catch((err: any) => {
      console.error('Failed to send invitation email:', err);
    });
  }

  return newAccess;
};

/**
 * Update member access level (only OWNER can update)
 */
export const updateMemberAccess = async (
  userId: string,
  elderId: string,
  targetUserId: string,
  newAccessLevel: AccessLevel
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
    throw createError.ownerOnly();
  }

  // Cannot update self
  if (targetUserId === userId) {
    throw createError.cannotUpdateSelf();
  }

  // Check target user access
  const targetAccess = await prisma.userElderAccess.findUnique({
    where: {
      userId_elderId: {
        userId: targetUserId,
        elderId,
      },
    },
  });

  if (!targetAccess) {
    throw createError.memberNotFound();
  }

  // Cannot change another Owner's role
  if (targetAccess.accessLevel === 'OWNER') {
    throw createError.cannotModifyOwner();
  }

  // Only allow switching between EDITOR and VIEWER
  if (newAccessLevel !== 'EDITOR' && newAccessLevel !== 'VIEWER') {
    throw createError.invalidAccessLevel();
  }

  const updatedAccess = await prisma.userElderAccess.update({
    where: {
      userId_elderId: {
        userId: targetUserId,
        elderId,
      },
    },
    data: {
      accessLevel: newAccessLevel,
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

  return updatedAccess;
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
    throw createError.ownerOnly();
  }

  // Cannot remove self
  if (memberUserId === userId) {
    throw createError.cannotRemoveSelf();
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
    throw createError.cannotModifyOwner();
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
    throw createError.accessDenied();
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
