import QRCode from 'qrcode';
import { createError } from './ApiError';

/**
 * Generate QR Code as Data URL (base64)
 */
export const generateQRCode = async (data: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 2,
    });
  } catch (error) {
    throw createError.qrcodeGenerationFailed();
  }
};

/**
 * Generate device pairing QR code
 * Format: HTTPS URL that shows device info and can open the app
 * https://fallhelp.app/pair?deviceCode=XXXXX&serialNumber=XXXXX
 * (ถ้ายังไม่มี domain ให้ใช้ข้อมูล JSON แทน)
 */
export const generateDevicePairingQR = async (
  deviceCode: string,
  serialNumber: string
): Promise<string> => {
  // Use JSON format for now (แสดงข้อมูลได้ทุกแอปสแกน QR)
  const data = JSON.stringify({
    type: 'FALLHELP_DEVICE',
    deviceCode,
    serialNumber,
    pairUrl: `fallhelp://pair?deviceCode=${deviceCode}&serialNumber=${serialNumber}`
  }, null, 2);
  
  return generateQRCode(data);
};

/**
 * Generate WiFi configuration QR code
 * Format: WIFI:T:WPA;S:ssid;P:password;;
 */
export const generateWiFiQR = async (ssid: string, password: string): Promise<string> => {
  const data = `WIFI:T:WPA;S:${ssid};P:${password};;`;
  return generateQRCode(data);
};
