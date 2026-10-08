/**
 * กราฟชีพจรแบบจอ monitor: เส้นโค้งนุ่ม และไหลจากขวาไปซ้ายต่อเนื่องระหว่างค่าแต่ละรอบ
 * - ทุกค่าใหม่ เลื่อนกราฟเข้ามาหนึ่งช่องด้วย CSS animation (ยาวเท่ารอบส่งค่า)
 * - ค่าล่าสุดมีจุดเรืองแสง (วาดด้วย non-scaling stroke จึงกลมแม้ SVG ถูกยืด)
 */
import { useI18n } from "../i18n/useI18n";
import { smoothPath, type Point } from "../lib/smoothPath";

interface SparklineProps {
  values: readonly number[];
  min: number;
  max: number;
  /** Time between readings; the chart scrolls one step over this duration. */
  stepMs: number;
  /** Number of readings visible across the chart. */
  capacity: number;
}

const WIDTH = 600;
const HEIGHT = 176;
const PAD_Y = 18;

const frame =
  "h-44 w-full rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40";

export default function Sparkline({ values, min, max, stepMs, capacity }: SparklineProps) {
  const { t } = useI18n();
  if (values.length < 2) {
    return (
      <div className={`${frame} flex items-center justify-center text-xs text-gray-400`}>
        {t.heart.waiting}
      </div>
    );
  }

  const step = WIDTH / (capacity - 1);
  const range = Math.max(1, max - min);
  const toY = (value: number) => PAD_Y + (1 - (value - min) / range) * (HEIGHT - 2 * PAD_Y);
  // The newest reading sits just inside the right edge; older ones extend to the left.
  const right = WIDTH - 8;
  const points: Point[] = values.map((value, i) => ({
    x: right - (values.length - 1 - i) * step,
    y: toY(value),
  }));
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) return null;
  const line = smoothPath(points);
  const area = `${line} L${right},${HEIGHT} L${first.x},${HEIGHT} Z`;
  const dot = `M${last.x},${last.y} l0.01,0`;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      className={`${frame} overflow-hidden`}
      role="img"
      aria-label={t.heart.chartLabel}
    >
      <defs>
        <linearGradient id="hr-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(14 165 233)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="rgb(14 165 233)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1={0}
          x2={WIDTH}
          y1={HEIGHT * f}
          y2={HEIGHT * f}
          strokeDasharray="4 6"
          vectorEffect="non-scaling-stroke"
          className="stroke-gray-200 dark:stroke-gray-700"
        />
      ))}
      {/* Re-keyed on every reading so the slide restarts: flows continuously like a monitor */}
      <g
        key={values.length}
        className="hr-flow"
        style={{ animationDuration: `${stepMs}ms`, ["--hr-step" as string]: `${step}px` }}
      >
        <path d={area} fill="url(#hr-fill)" />
        <path
          d={line}
          fill="none"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="stroke-sky-500"
        />
        <path
          d={dot}
          strokeWidth={18}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="animate-pulse stroke-sky-500/30"
        />
        <path
          d={dot}
          strokeWidth={9}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="stroke-sky-500"
        />
      </g>
    </svg>
  );
}
