import { Request, Response } from 'express';
import prisma from '../prisma.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { createError, ApiError } from '../utils/ApiError.js';

// ==========================================
// 🎮 LAYER: Interface (Controller)
// Purpose: Handle emergency contact management requests
// ==========================================

/**
 * POST /api/elders/:elderId/emergency-contacts
 */
export const createEmergencyContact = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const elderId = req.params.elderId || req.params.id;
  const { name, phone, relationship, priority } = req.body;

  // Check if user is OWNER
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

  // Calculate next priority
  const lastContact = await prisma.emergencyContact.findFirst({
    where: {
      elderId,
    },
    orderBy: {
      priority: 'desc',
    },
  });

  const nextPriority = (lastContact?.priority || 0) + 1;

  const contact = await prisma.emergencyContact.create({
    data: {
      elderId,
      name,
      phone,
      relationship,
      priority: nextPriority,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Emergency contact created successfully',
    data: contact,
  });
});

/**
 * GET /api/elders/:elderId/emergency-contacts
 */
export const getEmergencyContacts = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const elderId = req.params.elderId || req.params.id;

  // Check if user has access
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

  const contacts = await prisma.emergencyContact.findMany({
    where: {
      elderId,
    },
    orderBy: {
      priority: 'asc',
    },
  });

  res.json({
    success: true,
    data: contacts,
  });
});

/**
 * PUT /api/emergency-contacts/:id
 */
export const updateEmergencyContact = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const { name, phone, relationship, priority } = req.body;

  // Get contact
  const contact = await prisma.emergencyContact.findUnique({
    where: { id },
  });

  if (!contact) {
    throw new ApiError('resource_not_found', 'ไม่พบข้อมูลผู้ติดต่อฉุกเฉิน');
  }

  // Check if user is OWNER
  const access = await prisma.userElderAccess.findUnique({
    where: {
      userId_elderId: {
        userId,
        elderId: contact.elderId,
      },
    },
  });

  if (!access || (access.accessLevel !== 'OWNER' && access.accessLevel !== 'EDITOR')) {
    throw createError.editorRequired();
  }

  const updated = await prisma.emergencyContact.update({
    where: { id },
    data: {
      name,
      phone,
      relationship,
      priority,
    },
  });

  res.json({
    success: true,
    message: 'Emergency contact updated successfully',
    data: updated,
  });
});

/**
 * DELETE /api/emergency-contacts/:id
 */
export const deleteEmergencyContact = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  // Get contact
  const contact = await prisma.emergencyContact.findUnique({
    where: { id },
  });

  if (!contact) {
    throw new ApiError('resource_not_found', 'ไม่พบข้อมูลผู้ติดต่อฉุกเฉิน');
  }

  // Check if user is OWNER
  const access = await prisma.userElderAccess.findUnique({
    where: {
      userId_elderId: {
        userId,
        elderId: contact.elderId,
      },
    },
  });

  if (!access || (access.accessLevel !== 'OWNER' && access.accessLevel !== 'EDITOR')) {
    throw createError.editorRequired();
  }

  // Hard delete
  await prisma.emergencyContact.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Emergency contact deleted successfully',
  });
});

/**
 * PUT /api/elders/:elderId/emergency-contacts/reorder
 */
export const reorderEmergencyContacts = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const elderId = req.params.elderId || req.params.id;
  const { contactIds } = req.body; // Array of IDs in new order

  if (!Array.isArray(contactIds) || contactIds.length === 0) {
    throw createError.validationError('รหัสผู้ติดต่อไม่ถูกต้อง');
  }

  // Check access
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

  // Use transaction to update priorities safely
  await prisma.$transaction(async (tx) => {
    // 1. Shift all priorities to avoid unique constraint violation
    // We use a large offset (e.g., 1000)
    for (const id of contactIds) {
      await tx.emergencyContact.update({
        where: { id },
        data: { priority: { increment: 1000 } },
      });
    }

    // 2. Set correct priorities
    for (let i = 0; i < contactIds.length; i++) {
      await tx.emergencyContact.update({
        where: { id: contactIds[i] },
        data: { priority: i + 1 },
      });
    }
  });

  res.json({
    success: true,
    message: 'Contacts reordered successfully',
  });
});
