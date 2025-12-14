import { Request, Response } from 'express';
import * as deviceService from '../services/deviceService';
import { asyncHandler } from '../middlewares/errorHandler';

// ==========================================
// 🎮 LAYER: Interface (Controller)
// Purpose: Handle device management and pairing requests
// ==========================================

/**
 * POST /api/devices (Admin only)
 */
export const createDevice = asyncHandler(async (req: Request, res: Response) => {
  const { serialNumber, firmwareVersion } = req.body;

  const device = await deviceService.createDevice({
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
 * GET /api/devices/qr/:deviceCode
 */
export const getDeviceQR = asyncHandler(async (req: Request, res: Response) => {
  const { deviceCode } = req.params;

  const device = await deviceService.getDeviceByCode(deviceCode);

  res.json({
    success: true,
    data: device,
  });
});

/**
 * POST /api/devices/pair
 */
export const pairDevice = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { deviceCode, elderId } = req.body;

  const device = await deviceService.pairDevice(userId, deviceCode, elderId);

  res.json({
    success: true,
    message: 'Device paired successfully',
    data: device,
  });
});

/**
 * DELETE /api/devices/:id/unpair
 */
export const unpairDevice = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const device = await deviceService.unpairDevice(userId, id);

  res.json({
    success: true,
    message: 'Device unpaired successfully',
    data: device,
  });
});

/**
 * PUT /api/devices/:id/wifi
 */
export const configureWiFi = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const { ssid, password, wifiPassword } = req.body;
  
  // Support both 'password' and 'wifiPassword' field names
  const finalPassword = password || wifiPassword;

  const result = await deviceService.configureWiFi(userId, id, ssid, finalPassword);

  res.json({
    success: true,
    message: 'WiFi configured successfully',
    data: result,
  });
});

/**
 * GET /api/devices/:id/config
 */
export const getDeviceConfig = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const config = await deviceService.getDeviceConfig(userId, id);

  res.json({
    success: true,
    data: config,
  });
});


