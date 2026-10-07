/**
 * รายการ log ของข้อความ MQTT ที่ simulator ส่ง (ใหม่สุดอยู่บน, จำกัดจำนวน)
 */
import type { DevicePayload } from "./payloads";

export type LogStatus = "sent" | "failed";

export interface LogEntry {
  id: number;
  at: number;
  topic: string;
  payload: DevicePayload;
  status: LogStatus;
  error?: string;
}

export const MAX_LOG_ENTRIES = 200;

export const appendLog = (
  entries: readonly LogEntry[],
  entry: LogEntry,
  max: number = MAX_LOG_ENTRIES
): LogEntry[] => [entry, ...entries].slice(0, max);
