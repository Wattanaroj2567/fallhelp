/**
 * ให้ promise จบภายในเวลาที่กำหนด ไม่งั้น reject ด้วยข้อความที่ให้มา
 * - ใช้กับ MQTT publish qos 1 ที่ค้างในคิวเมื่อ broker หลุด เพื่อให้ log แสดง failed
 */
export const withTimeout = <T>(promise: Promise<T>, ms: number, message: string): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    );
  });
