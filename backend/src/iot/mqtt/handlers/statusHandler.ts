import { DeviceStatusPayload } from '../topics';
import { EventType, EventSeverity } from '../../../generated/prisma/client.js';
import { createEvent } from '../../../services/eventService';
import { notifyDeviceOffline } from '../../../services/notificationService';
import prisma from '../../../prisma';
import { socketServer } from '../../socket/socketServer';
import createDebug from 'debug';

const log = createDebug('fallhelp:mqtt:status');

/**
 * Handle device status updates from MQTT
 */
export async function statusHandler(deviceId: string, payload: DeviceStatusPayload): Promise<void> {
  try {
    log('📊 Device status update for %s: %O', deviceId, payload);

    // 1. Find device and paired elder
    // ESP32 sends serialNumber (e.g., ESP32-6C689BDAF380) not deviceCode (e.g., 8E5D02FB)
    const device = await prisma.device.findFirst({
      where: { serialNumber: deviceId },
      include: {
        elder: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    if (!device) {
      log('❌ Device %s not found', deviceId);
      return;
    }

    // 2. Update device status in database
    const wasOnline = device.lastOnline
      ? Date.now() - device.lastOnline.getTime() < 5 * 60 * 1000 // 5 minutes
      : false;

    // Use server time instead of ESP32 millis() timestamp
    // ESP32 sends millis() (relative time since boot), not Unix timestamp
    const serverTimestamp = new Date();

    // Update device status and WiFi status
    // If device is online, it means WiFi is connected (device cannot connect to MQTT without WiFi)
    // Ensure all fields are populated - never leave fields empty unnecessarily
    await prisma.device.update({
      where: { id: device.id },
      data: {
        lastOnline: serverTimestamp, // Always update when device sends status
        firmwareVersion: payload.firmwareVersion || device.firmwareVersion || '1.0.0', // Default if missing
        status: payload.online ? 'ACTIVE' : 'INACTIVE',
        updatedAt: serverTimestamp, // Explicitly update timestamp
      },
    });

    // Update WiFi status in DeviceConfig
    // If device sends online=true, WiFi must be connected (device needs WiFi to connect to MQTT)
    // Ensure all fields are populated - never leave fields empty unnecessarily
    if (payload.online) {
      await prisma.deviceConfig.updateMany({
        where: { deviceId: device.id },
        data: {
          wifiStatus: 'CONNECTED',
          ipAddress: payload.ip || null, // ESP32 sends IP in status message - use null instead of undefined
          updatedAt: serverTimestamp, // Explicitly update timestamp
        },
      });
    } else {
      // Device offline - WiFi might be disconnected or MQTT connection lost
      // Only update to DISCONNECTED if it was CONFIGURING (to avoid overwriting ERROR state)
      await prisma.deviceConfig.updateMany({
        where: {
          deviceId: device.id,
          wifiStatus: 'CONFIGURING', // Only update if still in CONFIGURING state
        },
        data: {
          wifiStatus: 'DISCONNECTED',
          updatedAt: serverTimestamp, // Explicitly update timestamp
        },
      });
    }

    // 3. Check if device went offline
    if (wasOnline && !payload.online && device.elderId) {
      log('⚠️ Device %s went offline', deviceId);
      await createEvent({
        elderId: device.elderId,
        deviceId: device.id,
        type: 'DEVICE_OFFLINE' as EventType,
        severity: 'WARNING' as EventSeverity,
        timestamp: serverTimestamp,
        metadata: {
          previousOnlineAt: device.lastOnline,
        },
      });

      // Notify caregivers
      await notifyDeviceOffline(device.elderId, 'offline-' + Date.now(), serverTimestamp);
    } else if (!wasOnline && payload.online && device.elderId) {
      log('✅ Device %s came online', deviceId);
      await createEvent({
        elderId: device.elderId,
        deviceId: device.id,
        type: 'DEVICE_ONLINE' as EventType,
        severity: 'NORMAL' as EventSeverity,
        timestamp: serverTimestamp,
      });
    }

    // 4. Emit real-time update via Socket.io
    if (device.elderId && device.elder) {
      const elderName = `${device.elder.firstName} ${device.elder.lastName}`;
      socketServer.emitDeviceStatusUpdate({
        deviceId: device.id,
        deviceCode: device.deviceCode,
        elderId: device.elderId,
        elderName,
        online: payload.online,
        signalStrength: payload.signalStrength,
        firmwareVersion: payload.firmwareVersion,
        timestamp: serverTimestamp,
      });
    }

    log('✅ Device status updated for %s', deviceId);
  } catch (error) {
    log('❌ Error handling device status: %O', error);
  }
}
