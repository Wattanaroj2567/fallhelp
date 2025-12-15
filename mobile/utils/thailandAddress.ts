// utils/thailandAddress.ts
import thailandData from '@/assets/thailand-address.json';

export interface ThailandAddress {
  district: string; // ตำบล/แขวง
  amphoe: string; // อำเภอ/เขต
  province: string; // จังหวัด
  zipcode: number; // รหัสไปรษณีย์
}

const data: ThailandAddress[] = thailandData as ThailandAddress[];

/**
 * Get all provinces
 */
export function getProvinces(): string[] {
  const provinces = new Set<string>();
  data.forEach((item) => provinces.add(item.province));
  return Array.from(provinces).sort();
}

/**
 * Get all amphoes in a province
 */
export function getAmphoes(province: string): string[] {
  const amphoes = new Set<string>();
  data.filter((item) => item.province === province).forEach((item) => amphoes.add(item.amphoe));
  return Array.from(amphoes).sort();
}

/**
 * Get all districts in an amphoe
 */
export function getDistricts(province: string, amphoe: string): string[] {
  const districts = new Set<string>();
  data
    .filter((item) => item.province === province && item.amphoe === amphoe)
    .forEach((item) => districts.add(item.district));
  return Array.from(districts).sort();
}

/**
 * Get zipcode for a district
 */
export function getZipcode(province: string, amphoe: string, district: string): number | null {
  const found = data.find(
    (item) => item.province === province && item.amphoe === amphoe && item.district === district,
  );
  return found ? found.zipcode : null;
}
