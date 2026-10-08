/**
 * สีสถานะมาตรฐานที่ใช้ทั้ง dashboard (ธีมสว่างแบบเดียวกับ admin panel)
 * ok = เขียว (ออนไลน์/สำเร็จ), pending = เหลืองอำพัน (รอ/สงสัยล้ม),
 * danger = แดง (ล้มยืนยัน/ผิดพลาด), muted = เทา (ออฟไลน์/พัก), info = ฟ้า (ชีพจร)
 */
export type Tone = "ok" | "pending" | "danger" | "muted" | "info";

export const TONE_DOT: Record<Tone, string> = {
  ok: "bg-green-500",
  pending: "bg-amber-500",
  danger: "bg-red-500",
  muted: "bg-gray-400",
  info: "bg-sky-500",
};

export const TONE_TEXT: Record<Tone, string> = {
  ok: "text-green-600 dark:text-green-400",
  pending: "text-amber-600 dark:text-amber-400",
  danger: "text-red-600 dark:text-red-400",
  muted: "text-gray-500 dark:text-gray-400",
  info: "text-sky-600 dark:text-sky-400",
};

export const TONE_STROKE: Record<Tone, string> = {
  ok: "stroke-green-500",
  pending: "stroke-amber-500",
  danger: "stroke-red-500",
  muted: "stroke-gray-400",
  info: "stroke-sky-500",
};

export const TONE_BADGE: Record<Tone, string> = {
  ok: "bg-green-50 text-green-700 ring-green-200 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/30",
  pending:
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30",
  danger:
    "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/30",
  muted:
    "bg-gray-100 text-gray-600 ring-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:ring-gray-600",
  info: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-500/30",
};

/** Soft icon tile, like the admin dashboard stat cards. */
export const TONE_TILE: Record<Tone, string> = {
  ok: "bg-green-50 text-green-600 ring-green-100 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20",
  pending:
    "bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
  danger:
    "bg-red-50 text-red-600 ring-red-100 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
  muted:
    "bg-gray-50 text-gray-500 ring-gray-200 dark:bg-gray-700/50 dark:text-gray-400 dark:ring-gray-600",
  info: "bg-sky-50 text-sky-600 ring-sky-100 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-500/20",
};
