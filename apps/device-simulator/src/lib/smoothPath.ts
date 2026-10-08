/**
 * สร้าง SVG path แบบเส้นโค้งนุ่มผ่านทุกจุด (Catmull-Rom แปลงเป็น cubic Bézier)
 * ใช้วาดกราฟชีพจรให้ไหลลื่น ไม่หักเป็นเส้นตรง
 */
export interface Point {
  x: number;
  y: number;
}

const TENSION = 1 / 6;
const fmt = (n: number) => Number(n.toFixed(2)).toString();

export function smoothPath(points: readonly Point[]): string {
  const first = points[0];
  if (points.length < 2 || !first) return "";

  let d = `M${fmt(first.x)},${fmt(first.y)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    if (!p1 || !p2) break;
    const p0 = points[i - 1] ?? p1;
    const p3 = points[i + 2] ?? p2;

    const c1x = p1.x + (p2.x - p0.x) * TENSION;
    const c1y = p1.y + (p2.y - p0.y) * TENSION;
    const c2x = p2.x - (p3.x - p1.x) * TENSION;
    const c2y = p2.y - (p3.y - p1.y) * TENSION;
    d += `C${fmt(c1x)},${fmt(c1y)} ${fmt(c2x)},${fmt(c2y)} ${fmt(p2.x)},${fmt(p2.y)}`;
  }
  return d;
}
