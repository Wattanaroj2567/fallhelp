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

    await prisma.device.update({
      where: { id: device.id },
      data: {
        lastOnline: new Date(payload.timestamp),
        firmwareVersion: payload.firmwareVersion || device.firmwareVersion,
        status: payload.online ? 'ACTIVE' : 'INACTIVE',
      },
    });

    // 3. Check if device went offline
    if (wasOnline && !payload.online && device.elderId) {
      log('⚠️ Device %s went offline', deviceId);
      await createEvent({
        elderId: device.elderId,
        deviceId: device.id,
        type: 'DEVICE_OFFLINE' as EventType,
        severity: 'WARNING' as EventSeverity,
        timestamp: new Date(payload.timestamp),
        metadata: {
          previousOnlineAt: device.lastOnline,
        },
      });

      // Notify caregivers
      await notifyDeviceOffline(
        device.elderId,
        'offline-' + Date.now(),
        new Date(payload.timestamp),
      );
    } else if (!wasOnline && payload.online && device.elderId) {
      log('✅ Device %s came online', deviceId);
      await createEvent({
        elderId: device.elderId,
        deviceId: device.id,
        type: 'DEVICE_ONLINE' as EventType,
        severity: 'NORMAL' as EventSeverity,
        timestamp: new Date(payload.timestamp),
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
        timestamp: new Date(payload.timestamp),
      });
    }

    log('✅ Device status updated for %s', deviceId);
  } catch (error) {
    log('❌ Error handling device status: %O', error);
  }
}
