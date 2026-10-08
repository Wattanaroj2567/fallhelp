/**
 * แผงชีพจร: ค่าล่าสุด, กราฟไหลต่อเนื่อง และปุ่มเลือกสถานการณ์ ต่ำ / ปกติ / สูง
 * - เปลี่ยนสถานการณ์แล้วค่าค่อยๆ ไต่ขึ้นหรือลง (heartRateSim) พร้อมข้อความบอกว่ากำลังเปลี่ยน
 * - ป้ายสถานะใช้เกณฑ์เดียวกับแอป: < 60 ต่ำกว่าปกติ, > 100 สูงกว่าปกติ
 */
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  HeartIcon as HeartOutlineIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/24/solid";
import type { ComponentType, SVGProps } from "react";
import { useI18n } from "../i18n/useI18n";
import type { Messages } from "../i18n/messages";
import { HEART_RATE_PRESETS, HR_BAND_BPM, type HeartRateMode } from "../lib/heartRateSim";
import Panel from "./Panel";
import Sparkline from "./Sparkline";
import StatusBadge from "./StatusBadge";
import type { Tone } from "./tones";

interface HeartRatePanelProps {
  bpm: number | null;
  history: readonly number[];
  mode: HeartRateMode;
  live: boolean;
  boosted: boolean;
  intervalMs: number;
  capacity: number;
  onModeChange: (mode: HeartRateMode) => void;
}

const MODES: {
  mode: HeartRateMode;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  active: string;
}[] = [
  {
    mode: "low",
    icon: ArrowTrendingDownIcon,
    active: "bg-blue-600 text-white shadow-sm",
  },
  {
    mode: "normal",
    icon: HeartOutlineIcon,
    active: "bg-green-600 text-white shadow-sm",
  },
  {
    mode: "high",
    icon: ArrowTrendingUpIcon,
    active: "bg-red-600 text-white shadow-sm",
  },
];

/** Same thresholds as the mobile app (utils/heartRate.ts). */
const describeBpm = (bpm: number, t: Messages): { label: string; tone: Tone } => {
  if (bpm > 100) return { label: t.heart.above, tone: "danger" };
  if (bpm < 60) return { label: t.heart.below, tone: "info" };
  return { label: t.heart.normal, tone: "ok" };
};

export default function HeartRatePanel({
  bpm,
  history,
  mode,
  live,
  boosted,
  intervalMs,
  capacity,
  onModeChange,
}: HeartRatePanelProps) {
  const { t } = useI18n();
  const target = HEART_RATE_PRESETS[mode];
  const low = Math.min(...history, target) - 5;
  const high = Math.max(...history, target) + 5;
  const status = bpm === null ? null : describeBpm(bpm, t);
  const ramping = live && bpm !== null && !boosted && Math.abs(bpm - target) > HR_BAND_BPM;

  let note: { text: string; up: boolean } | null = null;
  if (boosted) note = { text: t.heart.afterFall, up: true };
  else if (ramping && bpm !== null)
    note = {
      text: bpm < target ? t.heart.rising(target) : t.heart.falling(target),
      up: bpm < target,
    };
  const NoteIcon = note?.up === false ? ArrowTrendingDownIcon : ArrowTrendingUpIcon;

  return (
    <Panel
      title={t.heart.title}
      subtitle={t.heart.subtitle}
      icon={HeartOutlineIcon}
      iconTone={live ? "info" : "muted"}
      aside={
        <StatusBadge
          tone={live ? "info" : "muted"}
          label={live ? t.heart.live : t.heart.deviceOffline}
          pulse={live}
        />
      }
    >
      <div className="flex flex-1 flex-col justify-center">
        <div className="flex items-center justify-center gap-4 pt-2">
          <HeartIcon
            className={`h-14 w-14 ${live ? "animate-pulse text-rose-500" : "text-gray-300 dark:text-gray-600"}`}
            aria-hidden
          />
          <span
            className={`text-8xl font-semibold tabular-nums ${live ? "text-gray-900 dark:text-white" : "text-gray-300 dark:text-gray-600"}`}
          >
            {bpm ?? "--"}
          </span>
          <span className="mt-8 text-xl text-gray-500 dark:text-gray-400">BPM</span>
        </div>
        <div className="mt-2 flex h-7 items-center justify-center">
          {status && live ? <StatusBadge tone={status.tone} label={status.label} /> : null}
        </div>
        <p
          className={`my-2 flex h-5 items-center justify-center gap-1.5 text-sm text-amber-600 transition-opacity dark:text-amber-400 ${
            note ? "opacity-100" : "opacity-0"
          }`}
        >
          <NoteIcon className="h-4 w-4" aria-hidden />
          {note?.text}
        </p>

        <Sparkline values={history} min={low} max={high} stepMs={intervalMs} capacity={capacity} />
        <p className="mt-2 text-right text-xs text-gray-500 dark:text-gray-400">
          {t.heart.readings(history.length, HR_BAND_BPM)}
        </p>

        <div className="mt-5">
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">{t.heart.scenario}</p>
          <div
            role="radiogroup"
            aria-label={t.heart.scenario}
            className="grid grid-cols-3 gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-900"
          >
            {MODES.map(({ mode: value, icon: Icon, active }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={mode === value}
                onClick={() => onModeChange(value)}
                className={`flex items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                  mode === value
                    ? active
                    : "text-gray-600 hover:bg-white hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden />
                {t.heart.modes[value]}
                <span className="text-xs opacity-75">~{HEART_RATE_PRESETS[value]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}
