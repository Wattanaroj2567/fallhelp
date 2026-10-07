/**
 * แปลงสถานะการเชื่อมต่อ broker เป็นข้อความและสีสำหรับ UI
 * - reconnecting/offline ถือว่าหลุด (mqtt.js วน reconnect/close เมื่อ broker ไม่ตอบ)
 */
export type ConnectionState = "connecting" | "connected" | "reconnecting" | "offline" | "error";

export type ConnectionTone = "ok" | "pending" | "error";

export interface ConnectionDescription {
  label: string;
  tone: ConnectionTone;
}

export const describeConnection = (state: ConnectionState): ConnectionDescription => {
  switch (state) {
    case "connected":
      return { label: "Connected", tone: "ok" };
    case "connecting":
      return { label: "Connecting…", tone: "pending" };
    case "error":
      return { label: "Connection error", tone: "error" };
    case "reconnecting":
    case "offline":
      return { label: "Disconnected – retrying", tone: "error" };
  }
};
