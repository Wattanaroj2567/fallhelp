import { FallDetectionPayload } from '../topics';
import { createEvent } from '../../../services/eventService';
import { notifyFallDetection } from '../../../services/notificationService';
import prisma from '../../../prisma';
import { socketServer } from '../../socket/socketServer';
import createDebug from 'debug';

const log = createDebug('fallhelp:mqtt:fall');

/**
 * Handle fall detection events from MQTT
 */
export async function fallHandler(deviceId: string, payload: FallDetectionPayload): Promise<void> {
  try {
    log('🚨 Fall detected for device %s: %O', deviceId, payload);

    // 1. Find device and paired elder
    // ESP32 sends serialNumber (e.g., ESP32-6C689BDAF380) not deviceCode (e.g., 8E5D02FB)
    const device = await prisma.device.findFirst({
      where: { serialNumber: deviceId },
      include: {
        elder: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!device) {
      log('❌ Device %s not found', deviceId);
      return;
    }

    if (!device.elderId) {
      log('❌ Device %s not paired with any elder', deviceId);
      return;
    }

    // 2. Create fall event in database (no GPS data)
    const event = await createEvent({
      elderId: device.elderId,
      deviceId: device.id,
      type: 'FALL',
      severity: 'CRITICAL',
      accelerometerX: payload.accelerationX,
      accelerometerY: payload.accelerationY,
      accelerometerZ: payload.accelerationZ,
      metadata: { magnitude: payload.magnitude },
      timestamp: new Date(payload.timestamp),
    });

    log('✅ Fall event created: %s', event.id);

    // 3. Notify caregivers via Push Notification
    await notifyFallDetection(device.elderId, event.id, event.timestamp);

    // 4. Emit real-time update via Socket.io
    socketServer.emitFallDetected({
      eventId: event.id,
      elderId: device.elderId!,
      elderName: device.elder ? `${device.elder.firstName} ${device.elder.lastName}` : 'Unknown',
      deviceId: device.id,
      deviceCode: device.deviceCode,
      timestamp: event.timestamp,
      severity: event.severity,
      accelerationMagnitude: payload.magnitude,
    });

    log('📡 Real-time update sent for fall event %s', event.id);
  } catch (error) {
    log('❌ Error handling fall detection: %O', error);
  }
}
