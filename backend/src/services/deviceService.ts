import { Device, DeviceStatus } from '../generated/prisma/client.js';
import { generateDevicePairingQR, generateWiFiQR } from '../utils/qrcode.js';
import crypto from 'crypto';
import prisma from '../prisma.js';
import createDebug from 'debug';

const log = createDebug('fallhelp:device');

// ==========================================
// ⚙️ LAYER: Business Logic (Service)
// Purpose: Handle device pairing, configuration, and status updates
// ==========================================

/**
 * Generate unique device code (8 characters alphanumeric)
 */
const generateDeviceCode = (): string => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

/**
 * Create new device (Admin only)
 */
export const createDevice = async (data: {
  serialNumber: string;
  firmwareVersion?: string;
}) => {
  const deviceCode = generateDeviceCode();

  const device = await prisma.device.create({
    data: {
      deviceCode,
      serialNumber: data.serialNumber,
      status: 'UNPAIRED',
      firmwareVersion: data.firmwareVersion,
    },
  });

  // Generate QR code for pairing
  const qrCode = await generateDevicePairingQR(device.deviceCode, device.serialNumber);

  return {
    ...device,
    qrCode,
  };
};

/**
 * Get device by code with QR
 */
export const getDeviceByCode = async (deviceCode: string) => {
  const device = await prisma.device.findUnique({
    where: { deviceCode },
    include: {
      elder: true,
      config: true,
    },
  });

  if (!device) {
    throw new Error('Device not found');
  }

  const qrCode = await generateDevicePairingQR(device.deviceCode, device.serialNumber);

  return {
    ...device,
    qrCode,
  };
};

/**
 * Pair device with elder
 */
export const pairDevice = async (
  userId: string,
  deviceCode: string,
  elderId: string
) => {
  // Check if user is OWNER of this elder
  log(`[PairDevice] Checking ownership: userId=${userId}, elderId=${elderId}`);
  const access = await prisma.userElderAccess.findUnique({
    where: {
      userId_elderId: {
        userId,
        elderId,
      },
    },
  });
  log(`[PairDevice] Access record found:`, access);

  if (!access || access.accessLevel !== 'OWNER') {
    throw new Error('Only owner can pair devices');
  }

  // Find device
  const device = await prisma.device.findUnique({
    where: { deviceCode },
  });

  if (!device) {
    throw new Error('Device not found');
  }

  // Check if device is already paired
  if (device.elderId) {
    throw new Error('Device is already paired with another elder');
  }

  // Check if elder already has a device
  const elderDevice = await prisma.device.findFirst({
    where: { elderId },
  });

  if (elderDevice) {
    throw new Error('Elder already has a paired device');
  }

  // Pair device
  const pairedDevice = await prisma.device.update({
    where: { id: device.id },
    data: {
      elderId,
      status: 'PAIRED',
      lastOnline: new Date(),
    },
    include: {
      elder: true,
      config: true,
    },
  });

  // Create default config if not exists
  if (!pairedDevice.config) {
    await prisma.deviceConfig.create({
      data: {
        deviceId: pairedDevice.id,
        fallThreshold: 2.5,
        hrLowThreshold: 50,
        hrHighThreshold: 120,
        fallCancelTime: 30,
      },
    });
  }

  return pairedDevice;
};

/**
 * Unpair device
 */
export const unpairDevice = async (userId: string, deviceId: string) => {
  const device = await prisma.device.findUnique({
    where: { id: deviceId },
    include: { elder: true },
  });

  if (!device || !device.elderId) {
    throw new Error('Device not found or not paired');
  }

  // Check if user is OWNER
  const access = await prisma.userElderAccess.findUnique({
    where: {
      userId_elderId: {
        userId,
        elderId: device.elderId,
      },
    },
  });

  if (!access || access.accessLevel !== 'OWNER') {
    throw new Error('Only owner can unpair devices');
  }

  // Unpair device
  const unpaired = await prisma.device.update({
    where: { id: deviceId },
    data: {
      elderId: null,
      status: 'UNPAIRED',
    },
  });

  return unpaired;
};

/**
 * Force Unpair device (Admin only - bypass ownership check)
 */
export const forceUnpairDevice = async (deviceId: string) => {
  const device = await prisma.device.findUnique({
    where: { id: deviceId },
  });

  if (!device) {
    throw new Error('Device not found');
  }

  // Unpair device regardless of current status
  const unpaired = await prisma.device.update({
    where: { id: deviceId },
    data: {
      elderId: null,
      status: 'UNPAIRED',
    },
  });

  return unpaired;
};

/**
 * Configure WiFi
 */
export const configureWiFi = async (
  userId: string,
  deviceId: string,
  ssid: string,
  password: string
) => {
  const device = await prisma.device.findUnique({
    where: { id: deviceId },
    include: { config: true },
  });

  if (!device || !device.elderId) {
    throw new Error('Device not found or not paired');
  }

  // Check if user has access
  const access = await prisma.userElderAccess.findUnique({
    where: {
      userId_elderId: {
        userId,
        elderId: device.elderId,
      },
    },
  });

  if (!access || access.accessLevel !== 'OWNER') {
    throw new Error('Only owner can configure WiFi');
  }

  // Update WiFi config
  const config = await prisma.deviceConfig.upsert({
    where: { deviceId },
    create: {
      deviceId,
      ssid,
      wifiPassword: password, // TODO: Encrypt password
      wifiStatus: 'CONFIGURING',
    },
    update: {
      ssid,
      wifiPassword: password, // TODO: Encrypt password
      wifiStatus: 'CONFIGURING',
    },
  });

  // Real-world flow: Mobile app sends WiFi credentials to Backend
  // Then ESP32 fetches config via MQTT or HTTP polling
  // No QR code needed - more realistic UX

  return {
    config,
  };
};

/**
 * Get device config
 */
export const getDeviceConfig = async (userId: string, deviceId: string) => {
  const device = await prisma.device.findUnique({
    where: { id: deviceId },
    include: {
      config: true,
      elder: true,
    },
  });

  if (!device || !device.elderId) {
    throw new Error('Device not found or not paired');
  }

  // Check if user has access
  const access = await prisma.userElderAccess.findUnique({
    where: {
      userId_elderId: {
        userId,
        elderId: device.elderId,
      },
    },
  });

  if (!access) {
    throw new Error('Access denied');
  }

  return device.config;
};

/**
 * Update device config
 */
export const updateDeviceConfig = async (
  userId: string,
  deviceId: string,
  data: {
    fallThreshold?: number;
    hrLowThreshold?: number;
    hrHighThreshold?: number;
    fallCancelTime?: number;
  }
) => {
  const device = await prisma.device.findUnique({
    where: { id: deviceId },
  });

  if (!device || !device.elderId) {
    throw new Error('Device not found or not paired');
  }

  // Check if user is OWNER
  const access = await prisma.userElderAccess.findUnique({
    where: {
      userId_elderId: {
        userId,
        elderId: device.elderId,
      },
    },
  });

  if (!access || access.accessLevel !== 'OWNER') {
    throw new Error('Only owner can update device config');
  }

  const config = await prisma.deviceConfig.update({
    where: { deviceId },
    data,
  });

  return config;
};

/**
 * Update device status
 */
export const updateDeviceStatus = async (
  deviceId: string,
  status: DeviceStatus,
  lastOnline?: Date
) => {
  return prisma.device.update({
    where: { id: deviceId },
    data: {
      status,
      lastOnline: lastOnline || new Date(),
    },
  });
};

/**
 * Get all devices (Admin only)
 */
export const getAllDevices = async () => {
  return prisma.device.findMany({
    include: {
      elder: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      config: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};
