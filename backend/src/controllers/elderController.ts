import { Request, Response } from 'express';
import * as elderService from '../services/elderService';
import { asyncHandler } from '../middlewares/errorHandler';

// ==========================================
// 🎮 LAYER: Interface (Controller)
// Purpose: Handle elder management requests
// ==========================================

/**
 * POST /api/elders
 */
export const createElder = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const data = req.body;

  const elder = await elderService.createElder(userId, data);

  res.status(201).json({
    success: true,
    message: 'Elder created successfully',
    data: elder,
  });
});

/**
 * GET /api/elders
 */
export const getElders = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const elders = await elderService.getEldersByUser(userId);

  res.json({
    success: true,
    data: elders,
  });
});

/**
 * GET /api/elders/:id
 */
export const getElderById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const elder = await elderService.getElderById(userId, id);

  res.json({
    success: true,
    data: elder,
  });
});

/**
 * PUT /api/elders/:id
 */
export const updateElder = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const data = req.body;

  const elder = await elderService.updateElder(userId, id, data);

  res.json({
    success: true,
    message: 'Elder updated successfully',
    data: elder,
  });
});

/**
 * PATCH /api/elders/:id/deactivate
 */
export const deactivateElder = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const result = await elderService.deactivateElder(userId, id);

  res.json({
    success: true,
    data: result,
  });
});

/**
 * DELETE /api/elders/:id
 */
export const deleteElder = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const result = await elderService.deleteElder(userId, id);

  res.json({
    success: true,
    message: 'Elder deleted successfully',
    data: result,
  });
});

/**
 * POST /api/elders/:id/members
 */
export const inviteMember = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const { email } = req.body;

  const access = await elderService.inviteMember(userId, id, email);

  res.status(201).json({
    success: true,
    message: 'Member invited successfully',
    data: access,
  });
});

/**
 * PATCH /api/elders/:id/members/:userId
 */
export const updateMemberAccess = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id, userId: memberUserId } = req.params;
  const { accessLevel } = req.body;

  const result = await elderService.updateMemberAccess(userId, id, memberUserId, accessLevel);

  res.json({
    success: true,
    message: 'Member access updated successfully',
    data: result,
  });
});

/**
 * DELETE /api/elders/:id/members/:userId
 */
export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id, userId: memberUserId } = req.params;

  const result = await elderService.removeMember(userId, id, memberUserId);

  res.json({
    success: true,
    data: result,
  });
});

/**
 * GET /api/elders/:id/members
 */
export const getElderMembers = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const members = await elderService.getElderMembers(userId, id);

  res.json({
    success: true,
    data: members,
  });
});
