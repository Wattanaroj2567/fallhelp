import { Request, Response } from 'express';
import * as adminService from '../services/adminService';
import * as deviceService from '../services/deviceService';
import { asyncHandler } from '../middlewares/errorHandler';

// ==========================================
// 🎮 LAYER: Interface (Controller)
// Purpose: Handle admin dashboard and system management requests
// ==========================================

/**
 * GET /api/admin/dashboard
 */
export const getDashboardSummary = asyncHandler(async (req: Request, res: Response) => {
  const summary = await adminService.getDashboardSummary();

  res.json({
    success: true,
    data: summary,
  });
});

/**
 * GET /api/admin/users
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search } = req.query;

  const result = await adminService.getAllUsers({
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
    search: search as string,
  });

  res.json({
    success: true,
    data: result.users,
    pagination: result.pagination,
  });
});

/**
 * GET /api/admin/elders
 */
export const getAllElders = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, includeInactive } = req.query;

  const result = await adminService.getAllElders({
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
    includeInactive: includeInactive === 'true',
  });

  res.json({
    success: true,
    data: result.elders,
    pagination: result.pagination,
  });
});

/**
 * POST /api/admin/devices
 */
export const createDevice = asyncHandler(async (req: Request, res: Response) => {
  const { serialNumber, firmwareVersion } = req.body;

  const device = await adminService.createDevice({
    serialNumber,
    firmwareVersion,
  });

  res.status(201).json({
    success: true,
    message: 'Device created successfully',
    data: device,
  });
});

/**
 * GET /api/admin/devices
 */
export const getAllDevices = asyncHandler(async (req: Request, res: Response) => {
  const devices = await adminService.getAllDevices();

  res.json({
    success: true,
    data: devices,
  });
});

/**
 * DELETE /api/admin/devices/:id
 */
export const deleteDevice = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await adminService.deleteDevice(id);

  res.json({
    success: true,
    message: 'Device deleted successfully',
  });
});

/**
 * POST /api/admin/devices/:id/unpair
 */
export const forceUnpairDevice = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await deviceService.forceUnpairDevice(id);

  res.json({
    success: true,
    message: 'Device unpaired successfully',
  });
});



/**
 * GET /api/admin/events/stats
 */
export const getEventSummary = asyncHandler(async (req: Request, res: Response) => {
  const { days } = req.query;

  const summary = await adminService.getEventSummary(
    days ? parseInt(days as string) : 30
  );

  res.json({
    success: true,
    data: summary,
  });
});
