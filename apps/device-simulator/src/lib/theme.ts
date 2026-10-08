/**
 * ธีมสว่าง/มืดของ simulator (แบบเดียวกับ admin panel)
 * - ใช้ค่าที่ผู้ใช้เลือกไว้ใน localStorage ก่อน ถ้ายังไม่เคยเลือกใช้ตามธีมของเครื่อง
 */
export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "fallhelp-simulator-theme";

export const initialTheme = (saved: string | null, prefersDark: boolean): Theme =>
  saved === "light" || saved === "dark" ? saved : prefersDark ? "dark" : "light";

export const toggleTheme = (theme: Theme): Theme => (theme === "dark" ? "light" : "dark");
