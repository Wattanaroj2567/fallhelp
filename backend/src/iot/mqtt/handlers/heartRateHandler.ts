import { HeartRatePayload } from '../topics';
import { EventType, EventSeverity } from '../../../generated/prisma/client.js';
import { createEvent } from '../../../services/eventService';
import { notifyHeartRateAlert } from '../../../services/notificationService';
import prisma from '../../../prisma';
import { socketServer } from '../../socket/socketServer';
import createDebug from 'debug';

const log = createDebug('fallhelp:mqtt:heartrate');

/**
 * Handle heart rate readings from MQTT
 */
export async function heartRateHandler(deviceId: string, payload: HeartRatePayload): Promise<void> {
  try {
    log('💓 Heart rate reading for device %s: %d BPM', deviceId, payload.heartRate);

    // 1. Find device and paired elder
    // ESP32 sends serialNumber (e.g., ESP32-6C689BDAF380) not deviceCode (e.g., 8E5D02FB)
    const device = await prisma.device.findFirst({
      where: { serialNumber: deviceId },
      include: {
        elder: {
          select: { id: true, firstName: true, lastName: true },
        },
        config: {
          select: { hrLowThreshold: true, hrHighThreshold: true },
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

    // 2. Check if heart rate is abnormal
    const hrLow = device.config?.hrLowThreshold ?? 50;
    const hrHigh = device.config?.hrHighThreshold ?? 120;
    const isLow = payload.heartRate < hrLow;
    const isHigh = payload.heartRate > hrHigh;
    const isAbnormal = isLow || isHigh;

    // Use server time instead of ESP32 millis() timestamp
    // ESP32 sends millis() (relative time since boot), not Unix timestamp
    const serverTimestamp = new Date();

    // 3. Only create event if abnormal
    if (isAbnormal) {
      const eventType = isLow ? 'HEART_RATE_LOW' : 'HEART_RATE_HIGH';
      const severity = 'CRITICAL';

      const event = await createEvent({
        elderId: device.elderId,
        deviceId: device.id,
        type: eventType as EventType,
        severity: severity as EventSeverity,
        value: payload.heartRate,
        metadata: {
          threshold: isLow ? hrLow : hrHigh,
          direction: isLow ? 'LOW' : 'HIGH',
        },
        timestamp: serverTimestamp,
      });

      log('⚠️ Abnormal heart rate event created: %s', event.id);

      // Notify caregivers
      await notifyHeartRateAlert(
        device.elderId,
        event.id,
        event.timestamp,
        payload.heartRate,
        isLow ? 'LOW' : 'HIGH',
      );

      const elderName = device.elder
        ? `${device.elder.firstName} ${device.elder.lastName}`
        : 'Unknown';

      socketServer.emitHeartRateAlert({
        eventId: event.id,
        elderId: device.elderId,
        elderName,
        deviceId: device.id,
        deviceCode: device.deviceCode,
        timestamp: event.timestamp,
        heartRate: payload.heartRate,
        severity,
        type: isLow ? 'LOW' : 'HIGH',
      });
    } else {
      // Just emit real-time update for normal readings (no event creation)
      const elderName = device.elder
        ? `${device.elder.firstName} ${device.elder.lastName}`
        : 'Unknown';
      socketServer.emitHeartRateUpdate({
        elderId: device.elderId,
        elderName,
        deviceId: device.id,
        deviceCode: device.deviceCode,
        timestamp: serverTimestamp,
        heartRate: payload.heartRate,
      });
    }
  } catch (error) {
    log('❌ Error handling heart rate: %O', error);
  }
}
