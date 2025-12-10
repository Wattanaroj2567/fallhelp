// constants/theme.ts
import { MD3LightTheme, configureFonts } from 'react-native-paper';

// 1. กำหนดค่าสีหลักที่คุณใช้อยู่ (Material Design 3 Color Tokens)
const colors = {
  ...MD3LightTheme.colors,
  
  // === สีหลักของแบรนด์ ===
  primary: '#16AD78',        // ใช้กับ: ปุ่มหลัก, Checkbox ที่เลือก, Active Input Border, Tab ที่เลือก
  
  // === สีสถานะ ===
  error: '#EF4444',          // ใช้กับ: ข้อความ Error, Input Border ตอน Error, ปุ่มลบ/ยกเลิก
  
  // === สีพื้นหลัง ===
  background: '#FFFFFF',     // ใช้กับ: พื้นหลังหน้าจอหลัก (Screen Background)
  surface: '#FFFFFF',        // ใช้กับ: Card, Dialog, Bottom Sheet, Modal พื้นหลัง
    
  // === สีข้อความ (ใช้บน Surface) ===
  onSurface: '#374151',      // ใช้กับ: ข้อความหลัก, ตัวหนังสือที่พิมพ์ใน Input, Heading (Gray-700)
  onSurfaceVariant: '#a3a6af', // ใช้กับ: Label/Placeholder, Icon สีเทา, ข้อความรอง (Gray-500)
};

// 2. กำหนด Font เป็น "Kanit" ให้หมดทุกขนาด
const baseFont = {
  fontFamily: 'Kanit',
  fontWeight: '400' as const, // บังคับเป็น Regular
};

const fontConfig = {
  displayLarge: baseFont,
  displayMedium: baseFont,
  displaySmall: baseFont,
  headlineLarge: baseFont,
  headlineMedium: baseFont,
  headlineSmall: baseFont,
  titleLarge: baseFont,
  titleMedium: baseFont,
  titleSmall: baseFont,
  labelLarge: baseFont,
  labelMedium: baseFont,
  labelSmall: baseFont,
  bodyLarge: baseFont,
  bodyMedium: baseFont,
  bodySmall: baseFont,
};

// 3. รวมร่างเป็น Theme
export const AppTheme = {
  ...MD3LightTheme,
  colors: colors,
  fonts: configureFonts({ config: fontConfig }),
  roundness: 12, // ความโค้งของ Input
};