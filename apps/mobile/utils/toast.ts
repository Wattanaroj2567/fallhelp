/**
 * toast.ts
 *
 * Wrapper กลางสำหรับแสดง toast ด้วย config เดียวกันทั้งแอป
 *
 * สิ่งที่เกิดขึ้นในไฟล์นี้:
 * - รวม config การแสดง toast ไว้จุดเดียว
 * - กำหนดตำแหน่งและระยะเวลาแสดงผลให้สม่ำเสมอ
 * - เปิด helper สำหรับ toast แต่ละประเภทให้หน้าจอเรียกใช้สั้นลง
 */

import Toast from 'react-native-toast-message';

type ToastType = 'success' | 'error' | 'info';

let queuedSuccessToast: string | null = null;

function show(type: ToastType, message: string): void {
  Toast.show({
    type,
    text1: message,
    position: 'top',
    topOffset: 60,
    visibilityTime: 2000,
  });
}

export function showSuccessToast(message: string): void {
  show('success', message);
}

export function showSuccessToastOnNextFrame(message: string): void {
  // ใช้กับ flow ที่เพิ่งเปลี่ยน state/dialog ให้ toast เริ่มหลัง layout frame ปัจจุบันจบก่อน
  requestAnimationFrame(() => {
    showSuccessToast(message);
  });
}

export function queueSuccessToastForNextScreen(message: string): void {
  queuedSuccessToast = message;
}

export function consumeQueuedSuccessToast(): string | null {
  const message = queuedSuccessToast;
  queuedSuccessToast = null;
  return message;
}
