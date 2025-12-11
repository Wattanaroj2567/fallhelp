import { User, Gender } from '../generated/prisma/client.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import prisma from '../prisma.js';
import { ApiError } from '../utils/ApiError.js';

// ==========================================
// ⚙️ LAYER: Business Logic (Service)
// Purpose: Handle user profile management and related logic
// ==========================================

/**
 * Get user profile
 */
export const getUserProfile = async (userId: string): Promise<Omit<User, 'password'>> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    profileImage?: string;
    gender?: string;
  }
): Promise<Omit<User, 'password'>> => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...data,
      gender: data.gender as Gender, // Use Gender enum
    },
  });

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Change password
 */
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> => {
  // Get user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isPasswordValid = await comparePassword(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return {
    message: 'Password changed successfully',
  };
};

/**
 * Get user's elders
 */
export const getUserElders = async (userId: string) => {
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
 * Update push token for push notifications
 */
export const updatePushToken = async (
  userId: string,
  pushToken: string
): Promise<{ message: string }> => {
  // Validate Expo Push Token format
  if (!pushToken || !pushToken.startsWith('ExponentPushToken[')) {
    throw new Error('Invalid Expo Push Token format');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { pushToken },
  });

  return {
    message: 'Push token updated successfully',
  };
};

/**
 * Delete user account (Hard Delete)
 */
export const deleteUser = async (userId: string): Promise<{ message: string }> => {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError('user_not_found');
  }

  // Delete user (Cascade delete will handle related records)
  await prisma.user.delete({
    where: { id: userId },
  });

  return {
    message: 'User account deleted successfully',
  };
};
