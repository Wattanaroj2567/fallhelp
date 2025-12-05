import { User, AuthOtp } from '../generated/prisma/client.js';
import { hashPassword, comparePassword, generateOtp } from '../utils/password.js';
import { generateToken, JwtPayload } from '../utils/jwt.js';
import { addMinutes } from '../utils/time.js';
import { sendOtpEmail, sendWelcomeEmail } from '../utils/email.js';
import createDebug from 'debug';
import prisma from '../prisma.js';

const log = createDebug('fallhelp:auth');

const OTP_EXPIRY_MINUTES = 10;

// ==========================================
// ⚙️ LAYER: Business Logic (Service)
// Purpose: Handle core authentication logic and database interactions
// ==========================================

/**
 * Register new user
 */
export const register = async (data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: 'ADMIN' | 'CAREGIVER';
}): Promise<{ user: Omit<User, 'password'>; token: string }> => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(data.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: data.role || 'CAREGIVER',
    },
  });

  // Generate JWT token
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  const token = generateToken(payload);

  // Send welcome email (non-blocking)
  sendWelcomeEmail(user.email, user.firstName).catch((error) => {
    log('Failed to send welcome email: %O', error);
  });

  // Remove password from response
  const { password, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
};

/**
 * Login user
 */
export const login = async (
  identifier: string,
  password: string
): Promise<{ user: Omit<User, 'password'>; token: string }> => {
  // Find user by email or phone
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { phone: identifier }],
    },
  });

  if (!user) {
    throw new Error('Invalid email/phone or password');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new Error('Account is deactivated');
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate JWT token
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  const token = generateToken(payload);

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
};

/**
 * Request OTP
 */
export const requestOtp = async (
  email: string,
  purpose: 'PASSWORD_RESET' | 'EMAIL_VERIFICATION' | 'PHONE_VERIFICATION'
): Promise<{ message: string }> => {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Generate OTP
  const code = generateOtp();
  const expiresAt = addMinutes(OTP_EXPIRY_MINUTES);

  // Delete existing unused OTPs for this user and purpose
  await prisma.authOtp.deleteMany({
    where: {
      userId: user.id,
      purpose,
      isUsed: false,
    },
  });

  // Create new OTP
  await prisma.authOtp.create({
    data: {
      userId: user.id,
      code,
      purpose,
      expiresAt,
    },
  });

  // Send OTP via email
  try {
    await sendOtpEmail(email, code, purpose);
    log('OTP sent to %s for %s', email, purpose);
  } catch (error) {
    log('Failed to send OTP email: %O', error);
    // Still log to console for development if email fails
    log('[OTP] %s for %s: %s (expires in %d minutes)', purpose, email, code, OTP_EXPIRY_MINUTES);
  }

  return {
    message: `OTP sent to ${email}`,
  };
};

/**
 * Verify OTP
 */
export const verifyOtp = async (
  email: string,
  code: string,
  purpose: 'PASSWORD_RESET' | 'EMAIL_VERIFICATION' | 'PHONE_VERIFICATION'
): Promise<{ valid: boolean; message: string }> => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Find OTP
  const otp = await prisma.authOtp.findFirst({
    where: {
      userId: user.id,
      code,
      purpose,
      isUsed: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!otp) {
    return {
      valid: false,
      message: 'Invalid OTP code',
    };
  }

  // Check if expired
  if (new Date() > otp.expiresAt) {
    // ลบ OTP ที่หมดอายุทิ้ง
    await prisma.authOtp.delete({
      where: { id: otp.id },
    });

    return {
      valid: false,
      message: 'OTP has expired',
    };
  }

  // Mark as used และลบทิ้งเลย (ไม่เก็บ history)
  await prisma.authOtp.delete({
    where: { id: otp.id },
  });

  return {
    valid: true,
    message: 'OTP verified successfully',
  };
};

/**
 * Reset password
 */
export const resetPassword = async (
  email: string,
  code: string,
  newPassword: string
): Promise<{ message: string }> => {
  // Verify OTP first
  const otpResult = await verifyOtp(email, code, 'PASSWORD_RESET');

  if (!otpResult.valid) {
    throw new Error(otpResult.message);
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  return {
    message: 'Password reset successfully',
  };
};

/**
 * Get user profile
 */
export const getProfile = async (userId: string): Promise<Omit<User, 'password'>> => {
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
 * Cleanup expired OTPs (run periodically)
 * ลบ OTP ที่หมดอายุแล้วออกจาก database
 */
export const cleanupExpiredOtps = async (): Promise<number> => {
  const result = await prisma.authOtp.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(), // น้อยกว่าเวลาปัจจุบัน = หมดอายุ
      },
    },
  });

  if (result.count > 0) {
    log('Cleaned up %d expired OTPs', result.count);
  }

  return result.count;
};
