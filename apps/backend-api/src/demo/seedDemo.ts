/**
 * Demo seed — สร้างข้อมูลสำหรับนำเสนอโดยไม่ต้องมีฮาร์ดแวร์จริง
 * - บัญชี caregiver demo + ผู้สูงอายุ + ผู้ติดต่อฉุกเฉิน 2 คน + อุปกรณ์จำลองที่ pair แล้ว
 * - event ย้อนหลัง: หกล้มที่ยืนยันแล้ว (พร้อม notification) และหกล้มที่ถูกยกเลิกจากอุปกรณ์
 * - รันซ้ำได้ (idempotent): upsert ตาม unique key และสร้าง event ย้อนหลังใหม่ทุกครั้ง
 * - serial ต้องตรงกับ apps/device-simulator (DEFAULT_SERIAL)
 */
import type prisma from '../prisma';
import { getHrStatus } from '../constants/heartRate';
import { hashPassword } from '../utils/password';

type Db = typeof prisma;

export const DEMO_EMAIL = 'demo@fallhelp.app';
export const DEMO_DEVICE_SERIAL = 'ESP32-DE5000000001';
export const DEMO_DEVICE_CODE = 'DE500001';

const DAY_MS = 86_400_000;
const CONFIRMED_FALL_BPM = 96;
const MIN_PASSWORD_LENGTH = 8;

export interface DemoSeedInput {
  password: string;
  now?: Date;
}

export interface DemoSeedResult {
  userId: string;
  elderId: string;
  deviceId: string;
  eventIds: string[];
}

export async function seedDemo(db: Db, input: DemoSeedInput): Promise<DemoSeedResult> {
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    throw new Error('DEMO_PASSWORD must be at least 8 characters');
  }

  const now = input.now ?? new Date();
  const passwordHash = await hashPassword(input.password);

  return db.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { email: DEMO_EMAIL },
      update: { password: passwordHash, role: 'CAREGIVER' },
      create: {
        email: DEMO_EMAIL,
        password: passwordHash,
        firstName: 'Demo',
        lastName: 'Caregiver',
        role: 'CAREGIVER',
      },
    });

    const elderData = {
      firstName: 'สมศรี',
      lastName: 'ใจดี',
      gender: 'FEMALE',
      dateOfBirth: new Date('1950-03-15'),
      height: 155,
      weight: 52,
      diseases: 'ความดันโลหิตสูง',
      province: 'กรุงเทพมหานคร',
    };
    const elder = await tx.elder.upsert({
      where: { userId: user.id },
      update: elderData,
      create: { ...elderData, userId: user.id },
    });

    await tx.emergencyContact.deleteMany({ where: { elderId: elder.id } });
    await tx.emergencyContact.createMany({
      data: [
        {
          elderId: elder.id,
          name: 'สมชาย ใจดี',
          phone: '0800000001',
          relationship: 'ลูกชาย',
          priority: 1,
        },
        {
          elderId: elder.id,
          name: 'สมหญิง ใจดี',
          phone: '0800000002',
          relationship: 'ลูกสาว',
          priority: 2,
        },
      ],
    });

    // Device.elderId is unique: detach any other device from the demo elder first.
    await tx.device.updateMany({
      where: { elderId: elder.id, serialNumber: { not: DEMO_DEVICE_SERIAL } },
      data: { elderId: null, status: 'UNPAIRED' },
    });
    const device = await tx.device.upsert({
      where: { serialNumber: DEMO_DEVICE_SERIAL },
      update: { status: 'PAIRED', elderId: elder.id, wifiStatus: 'CONNECTED', lastOnline: now },
      create: {
        serialNumber: DEMO_DEVICE_SERIAL,
        deviceCode: DEMO_DEVICE_CODE,
        status: 'PAIRED',
        elderId: elder.id,
        wifiStatus: 'CONNECTED',
        lastOnline: now,
      },
    });

    // Reset history from the demo device and from any device the demo elder used before.
    // Notifications cascade with their events.
    await tx.event.deleteMany({ where: { OR: [{ deviceId: device.id }, { elderId: elder.id }] } });

    const confirmedAt = new Date(now.getTime() - 2 * DAY_MS);
    const confirmed = await tx.event.create({
      data: {
        fallStage: 'CONFIRMED',
        bpm: CONFIRMED_FALL_BPM,
        magnitude: 3.4,
        postureDelta: 82,
        timestamp: confirmedAt,
        elderId: elder.id,
        deviceId: device.id,
      },
    });
    await tx.notification.create({
      data: {
        title: '🚨 แจ้งเตือนฉุกเฉิน! ตรวจพบการหกล้ม',
        // Same format as notifyFallDetection in services/notificationService.ts
        message: `${elder.firstName} ${elder.lastName} ต้องการความช่วยเหลือด่วน! กรุณาตรวจสอบทันที ชีพจรขณะล้ม: ${CONFIRMED_FALL_BPM} BPM (${getHrStatus(CONFIRMED_FALL_BPM)})`,
        isRead: true,
        readAt: new Date(confirmedAt.getTime() + 60_000),
        createdAt: confirmedAt,
        userId: user.id,
        eventId: confirmed.id,
      },
    });

    const cancelledFallAt = new Date(now.getTime() - 5 * DAY_MS);
    const cancelled = await tx.event.create({
      data: {
        fallStage: 'CANCELLED',
        bpm: 84,
        magnitude: 2.9,
        postureDelta: 64,
        timestamp: cancelledFallAt,
        cancelledAt: new Date(cancelledFallAt.getTime() + 8_000),
        elderId: elder.id,
        deviceId: device.id,
      },
    });

    return {
      userId: user.id,
      elderId: elder.id,
      deviceId: device.id,
      eventIds: [confirmed.id, cancelled.id],
    };
  });
}
