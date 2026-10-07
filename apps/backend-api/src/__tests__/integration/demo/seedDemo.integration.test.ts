/**
 * Integration Tests — Demo seed
 * ตรวจว่า seedDemo สร้างข้อมูล demo ครบ และรันซ้ำได้โดยไม่ซ้ำซ้อน
 */
import { cleanDatabase, disconnectDatabase, prisma } from '../helpers';
import { DEMO_DEVICE_SERIAL, DEMO_EMAIL, seedDemo } from '../../../demo/seedDemo';
import { comparePassword } from '../../../utils/password';

describe('seedDemo', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await disconnectDatabase();
  });

  it('creates a caregiver, elder, contacts, paired device and history', async () => {
    const result = await seedDemo(prisma, { password: 'DemoPass123' });

    const user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
    expect(user?.role).toBe('CAREGIVER');
    expect(user ? await comparePassword('DemoPass123', user.password) : false).toBe(true);

    const device = await prisma.device.findUnique({ where: { serialNumber: DEMO_DEVICE_SERIAL } });
    expect(device?.status).toBe('PAIRED');
    expect(device?.elderId).toBe(result.elderId);

    expect(await prisma.emergencyContact.count({ where: { elderId: result.elderId } })).toBe(2);
    expect(await prisma.event.count({ where: { deviceId: result.deviceId } })).toBe(2);
    expect(await prisma.notification.count({ where: { userId: result.userId } })).toBe(1);
  });

  it('is idempotent and updates the password on re-run', async () => {
    await seedDemo(prisma, { password: 'DemoPass123' });
    await seedDemo(prisma, { password: 'DemoPass456' });

    expect(await prisma.user.count({ where: { email: DEMO_EMAIL } })).toBe(1);
    expect(await prisma.elder.count()).toBe(1);
    expect(await prisma.device.count({ where: { serialNumber: DEMO_DEVICE_SERIAL } })).toBe(1);
    expect(await prisma.emergencyContact.count()).toBe(2);
    expect(await prisma.event.count()).toBe(2);
    expect(await prisma.notification.count()).toBe(1);

    const user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
    expect(user ? await comparePassword('DemoPass456', user.password) : false).toBe(true);
  });

  it('rejects a password shorter than 8 characters', async () => {
    await expect(seedDemo(prisma, { password: 'short' })).rejects.toThrow(
      'DEMO_PASSWORD must be at least 8 characters',
    );
  });
});
