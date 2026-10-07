/**
 * CLI: สร้าง/รีเซ็ตข้อมูล demo สำหรับการนำเสนอ (ตรรกะอยู่ที่ src/demo/seedDemo.ts)
 * ใช้: npm run seed:demo — ต้องตั้ง DEMO_PASSWORD ใน apps/backend-api/.env เอง
 */
import 'dotenv/config';
import prisma from '../src/prisma';
import { DEMO_DEVICE_SERIAL, DEMO_EMAIL, seedDemo } from '../src/demo/seedDemo';

const main = async (): Promise<void> => {
  // The demo seed resets the demo account; never run it against production data.
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to run the demo seed with NODE_ENV=production.');
  }
  const password = process.env.DEMO_PASSWORD;
  if (!password) {
    throw new Error(
      'DEMO_PASSWORD is not set. Add it to apps/backend-api/.env (see docs/demo/DEMO_GUIDE.md).',
    );
  }
  const result = await seedDemo(prisma, { password });
  console.log('✅ Demo data ready');
  console.log(`   Login  : ${DEMO_EMAIL}`);
  console.log(`   Device : ${DEMO_DEVICE_SERIAL}`);
  console.log(`   Events : ${result.eventIds.length} historical events`);
};

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    console.error('❌ Demo seed failed:', error instanceof Error ? error.message : error);
    await prisma.$disconnect();
    process.exit(1);
  });
