/**
 * ข้อความบนหน้าจอ simulator สองภาษา (ไทย / อังกฤษ)
 * - แปลเฉพาะข้อความ UI: payload MQTT, topic, JSON ใน log และชนิด event คงเป็นภาษาอังกฤษตาม backend
 * - ภาษาไทยเป็นค่าเริ่มต้น (เหมือน admin panel); จำค่าที่เลือกไว้ใน localStorage
 */
import type { ConnectionState } from "../lib/connectionStatus";
import type { FallPhaseKind } from "../lib/fallPhase";
import type { HeartRateMode } from "../lib/heartRateSim";

export type Lang = "th" | "en";

export const LANGS: readonly Lang[] = ["th", "en"];
export const LANG_STORAGE_KEY = "fallhelp-simulator-lang";

export const initialLang = (saved: string | null): Lang => (saved === "en" ? "en" : "th");

interface PhaseText {
  title: string;
  detail: string;
  caption: string;
}

export interface Messages {
  locale: string;
  header: {
    product: string;
    broker: (label: string) => string;
    serialLabel: string;
    serialFormat: string;
    serialNotSeeded: string;
    toLight: string;
    toDark: string;
    language: string;
  };
  connection: Record<ConnectionState, string>;
  device: {
    title: string;
    subtitle: string;
    online: string;
    offline: string;
    goOnline: string;
    goOffline: string;
    wifi: string;
    heartbeat: string;
    every5s: string;
    stopped: string;
    lastStatus: string;
    offlineNote: string;
  };
  fall: {
    title: string;
    subtitle: string;
    phases: Record<FallPhaseKind, PhaseText>;
    goOnlineFirst: string;
    simulate: string;
    cancel: string;
    footnote: string;
  };
  heart: {
    title: string;
    subtitle: string;
    live: string;
    deviceOffline: string;
    above: string;
    below: string;
    normal: string;
    afterFall: string;
    rising: (target: number) => string;
    falling: (target: number) => string;
    readings: (count: number, band: number) => string;
    waiting: string;
    chartLabel: string;
    scenario: string;
    modes: Record<HeartRateMode, string>;
  };
  log: {
    title: string;
    count: (count: number) => string;
    empty: string;
    time: string;
    message: string;
    topic: string;
    result: string;
    sent: string;
    failed: string;
    heartRate: (bpm: number) => string;
    statusOnline: string;
    statusOffline: string;
    other: string;
  };
}

const en: Messages = {
  locale: "en-GB",
  header: {
    product: "Device Simulator",
    broker: (label) => `Broker: ${label}`,
    serialLabel: "Device serial",
    serialFormat: "Format: ESP32-XXXXXXXXXXXX (uppercase hex)",
    serialNotSeeded:
      "This is not the seeded demo device: the backend will ignore its messages and send it a reset command.",
    toLight: "Switch to light theme",
    toDark: "Switch to dark theme",
    language: "Language",
  },
  connection: {
    connected: "Connected",
    connecting: "Connecting…",
    error: "Connection error",
    reconnecting: "Disconnected – retrying",
    offline: "Disconnected – retrying",
  },
  device: {
    title: "Device",
    subtitle: "ESP32 neck device",
    online: "Online",
    offline: "Offline",
    goOnline: "Go online",
    goOffline: "Go offline",
    wifi: "Wi-Fi",
    heartbeat: "Status heartbeat",
    every5s: "every 5 s",
    stopped: "stopped",
    lastStatus: "Last status",
    offlineNote: "The app marks the device offline after 15 s without a status message.",
  },
  fall: {
    title: "Fall scenario",
    subtitle: "Suspected → 15 s cancel window → confirmed",
    phases: {
      idle: {
        title: "Ready",
        detail: "Press Simulate fall to send a suspected fall from the device.",
        caption: "ready",
      },
      suspected: {
        title: "Suspected fall",
        detail: "Device cancel window: the wearer can still cancel a false alarm.",
        caption: "sec to confirm",
      },
      confirmed: {
        title: "Fall confirmed — alert sent",
        detail: "Caregivers are notified. The backend ignores repeated falls until the timer ends.",
        caption: "sec cooldown",
      },
      cancelled: {
        title: "Cancelled by wearer",
        detail: "False alarm cancelled on the device. Short cooldown before the next fall.",
        caption: "sec cooldown",
      },
    },
    goOnlineFirst: "Go online first: an offline device cannot report a fall.",
    simulate: "Simulate fall",
    cancel: "Cancel on device",
    footnote:
      "Same sequence as the real device: suspected fall → 15 s cancel window → confirmed (or cancelled).",
  },
  heart: {
    title: "Heart rate",
    subtitle: "Ear-clip PPG sensor",
    live: "Live · every 5 s",
    deviceOffline: "Device offline",
    above: "Above normal",
    below: "Below normal",
    normal: "Normal",
    afterFall: "Rises after the fall, then settles back",
    rising: (target) => `Rising gradually to about ${target} BPM`,
    falling: (target) => `Falling gradually to about ${target} BPM`,
    readings: (count, band) => `last ${count} readings · varies ±${band} like an ear-clip sensor`,
    waiting: "Waiting for readings…",
    chartLabel: "Heart rate trend",
    scenario: "Scenario",
    modes: { low: "Low", normal: "Normal", high: "High" },
  },
  log: {
    title: "Sent messages",
    count: (count) => `${count} messages · click a row for JSON`,
    empty: "No messages sent yet.",
    time: "Time",
    message: "Message",
    topic: "Topic",
    result: "Result",
    sent: "sent",
    failed: "failed",
    heartRate: (bpm) => `heart rate · ${bpm} BPM`,
    statusOnline: "status · online",
    statusOffline: "status · offline",
    other: "message",
  },
};

const th: Messages = {
  locale: "th-TH",
  header: {
    product: "ตัวจำลองอุปกรณ์",
    broker: (label) => `Broker: ${label}`,
    serialLabel: "Serial ของอุปกรณ์",
    serialFormat: "รูปแบบ: ESP32-XXXXXXXXXXXX (hex ตัวพิมพ์ใหญ่)",
    serialNotSeeded:
      "ไม่ใช่อุปกรณ์ demo ที่ seed ไว้: backend จะไม่รับข้อความ และส่งคำสั่ง reset กลับมา",
    toLight: "เปลี่ยนเป็นธีมสว่าง",
    toDark: "เปลี่ยนเป็นธีมมืด",
    language: "ภาษา",
  },
  connection: {
    connected: "เชื่อมต่อแล้ว",
    connecting: "กำลังเชื่อมต่อ…",
    error: "เชื่อมต่อผิดพลาด",
    reconnecting: "หลุดการเชื่อมต่อ – กำลังลองใหม่",
    offline: "หลุดการเชื่อมต่อ – กำลังลองใหม่",
  },
  device: {
    title: "อุปกรณ์",
    subtitle: "อุปกรณ์คล้องคอ ESP32",
    online: "ออนไลน์",
    offline: "ออฟไลน์",
    goOnline: "เปิดอุปกรณ์",
    goOffline: "ปิดอุปกรณ์",
    wifi: "Wi-Fi",
    heartbeat: "ส่งสถานะ",
    every5s: "ทุก 5 วินาที",
    stopped: "หยุด",
    lastStatus: "สถานะล่าสุด",
    offlineNote: "แอปจะถือว่าอุปกรณ์ออฟไลน์ ถ้าไม่ได้รับสถานะเกิน 15 วินาที",
  },
  fall: {
    title: "สถานการณ์การล้ม",
    subtitle: "สงสัยว่าล้ม → ยกเลิกได้ใน 15 วินาที → ยืนยัน",
    phases: {
      idle: {
        title: "พร้อม",
        detail: "กด จำลองการล้ม เพื่อให้อุปกรณ์ส่งเหตุสงสัยว่าล้ม",
        caption: "พร้อม",
      },
      suspected: {
        title: "สงสัยว่าล้ม",
        detail: "ช่วงยกเลิกบนอุปกรณ์: ผู้สวมใส่ยังกดยกเลิกได้ ถ้าเป็นการแจ้งเตือนผิด",
        caption: "วินาทีก่อนยืนยัน",
      },
      confirmed: {
        title: "ยืนยันการล้ม — ส่งแจ้งเตือนแล้ว",
        detail: "แจ้งผู้ดูแลแล้ว backend จะไม่รับการล้มซ้ำจนกว่าจะหมดเวลา",
        caption: "วินาที · ช่วงพัก",
      },
      cancelled: {
        title: "ผู้สวมใส่ยกเลิกแล้ว",
        detail: "ยกเลิกการแจ้งเตือนผิดบนอุปกรณ์แล้ว พักสั้นๆ ก่อนล้มครั้งต่อไป",
        caption: "วินาที · ช่วงพัก",
      },
    },
    goOnlineFirst: "เปิดอุปกรณ์ก่อน: อุปกรณ์ที่ออฟไลน์แจ้งการล้มไม่ได้",
    simulate: "จำลองการล้ม",
    cancel: "ยกเลิกที่อุปกรณ์",
    footnote: "ลำดับเดียวกับอุปกรณ์จริง: สงสัยว่าล้ม → ยกเลิกได้ใน 15 วินาที → ยืนยัน (หรือยกเลิก)",
  },
  heart: {
    title: "ชีพจร",
    subtitle: "เซนเซอร์ PPG แบบหนีบหู",
    live: "สด · ทุก 5 วินาที",
    deviceOffline: "อุปกรณ์ออฟไลน์",
    above: "สูงกว่าปกติ",
    below: "ต่ำกว่าปกติ",
    normal: "ปกติ",
    afterFall: "สูงขึ้นหลังล้ม แล้วค่อยๆ ลดกลับ",
    rising: (target) => `กำลังค่อยๆ ขึ้นไปประมาณ ${target} BPM`,
    falling: (target) => `กำลังค่อยๆ ลงไปประมาณ ${target} BPM`,
    readings: (count, band) => `${count} ค่าล่าสุด · แกว่ง ±${band} แบบเซนเซอร์หนีบหู`,
    waiting: "รอค่าชีพจร…",
    chartLabel: "กราฟชีพจร",
    scenario: "สถานการณ์",
    modes: { low: "ต่ำ", normal: "ปกติ", high: "สูง" },
  },
  log: {
    title: "ข้อความที่ส่ง",
    count: (count) => `${count} ข้อความ · คลิกแถวเพื่อดู JSON`,
    empty: "ยังไม่มีข้อความที่ส่ง",
    time: "เวลา",
    message: "ข้อความ",
    topic: "Topic",
    result: "ผล",
    sent: "ส่งแล้ว",
    failed: "ล้มเหลว",
    heartRate: (bpm) => `ชีพจร · ${bpm} BPM`,
    statusOnline: "สถานะ · ออนไลน์",
    statusOffline: "สถานะ · ออฟไลน์",
    other: "ข้อความ",
  },
};

export const MESSAGES: Record<Lang, Messages> = { th, en };
