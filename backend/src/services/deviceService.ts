import { Device, DeviceStatus } from '../generated/prisma/client.js';
import { generateDevicePairingQR, generateWiFiQR } from '../utils/qrcode.js';
import crypto from 'crypto';
import prisma from '../prisma.js';
import createDebug from 'debug';
import { AppError } from '../utils/AppError.js';
import { encrypt, decrypt } from '../utils/encryption.js';
import { mqttClient } from '../iot/mqtt/mqttClient.js';
import { MQTT_TOPICS } from '../iot/mqtt/topics.js';

const log = createDebug('fallhelp:device');

// ... (skipping unchanged parts)

// ...



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
    throw new AppError('Only owner can pair devices', 403);
  }

  // Find device
  const device = await prisma.device.findUnique({
    where: { deviceCode },
  });

  if (!device) {
    throw new AppError('Device not found', 404);
  }

  // Check if device is already paired
  if (device.elderId) {
    throw new AppError('Device is already paired with another elder', 409);
  }

  // Check if elder already has a device
  const elderDevice = await prisma.device.findFirst({
    where: { elderId },
  });

  if (elderDevice) {
    throw new AppError('Elder already has a paired device', 409);
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
  deviceIdOrCode: string,
  ssid: string,
  password: string
) => {
  // Support both UUID (device.id) and deviceCode (8 chars)
  // Check if it looks like a UUID (contains hyphens) or deviceCode (8 chars alphanumeric)
  const isUuid = deviceIdOrCode.includes('-');
  
  const device = await prisma.device.findFirst({
    where: isUuid 
      ? { id: deviceIdOrCode }
      : { deviceCode: deviceIdOrCode },
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

  if (!access || (access.accessLevel !== 'OWNER' && access.accessLevel !== 'EDITOR')) {
    throw new Error('Only owner or editor can configure WiFi');
  }

  // Update WiFi config
  const config = await prisma.deviceConfig.upsert({
    where: { deviceId: device.id },
    create: {
      deviceId: device.id,
      ssid,
      wifiPassword: encrypt(password),
      wifiStatus: 'CONFIGURING',
    },
    update: {
      ssid,
      wifiPassword: encrypt(password),
      wifiStatus: 'CONFIGURING',
    },
  });

  // Real-world flow: Mobile app sends WiFi credentials to Backend
  // Then ESP32 fetches config via MQTT or HTTP polling
  // No QR code needed - more realistic UX

  // Publish config to device via MQTT
  // CRITICAL: ESP32 subscribes to topic with Serial Number, not DB ID
  const topic = MQTT_TOPICS.getConfigTopic(device.serialNumber);
  mqttClient.publish(topic, {
      wifiSSID: ssid,
      wifiPassword: password, // Sending plaintext to device (secure transport assumed e.g. MQTTS)
  });

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

  const config = device.config;
  if (config && config.wifiPassword) {
    try {
      config.wifiPassword = decrypt(config.wifiPassword);
    } catch (e) {
      // Logic: If decryption fails (old plaintext data), return as is or handle error
      // Ideally, we might want to migrate old data, but for now we fallback or leave it
    }
  }

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
