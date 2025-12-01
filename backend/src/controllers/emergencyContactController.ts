import { Request, Response } from 'express';
import prisma from '../prisma.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

// ==========================================
// 🎮 LAYER: Interface (Controller)
// Purpose: Handle emergency contact management requests
// ==========================================

/**
 * POST /api/elders/:elderId/emergency-contacts
 */
export const createEmergencyContact = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { elderId } = req.params;
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

  if (!access || access.accessLevel !== 'OWNER') {
    throw new Error('Only owner can manage emergency contacts');
  }

  const contact = await prisma.emergencyContact.create({
    data: {
      elderId,
      name,
      phone,
      relationship,
      priority,
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
  const { elderId } = req.params;

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
    throw new Error('Access denied');
  }

  const contacts = await prisma.emergencyContact.findMany({
    where: {
      elderId,
      isActive: true,
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
    throw new Error('Emergency contact not found');
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

  if (!access || access.accessLevel !== 'OWNER') {
    throw new Error('Only owner can update emergency contacts');
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
    throw new Error('Emergency contact not found');
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

  if (!access || access.accessLevel !== 'OWNER') {
    throw new Error('Only owner can delete emergency contacts');
  }

  // Soft delete
  await prisma.emergencyContact.update({
    where: { id },
    data: { isActive: false },
  });

  res.json({
    success: true,
    message: 'Emergency contact deleted successfully',
  });
});
