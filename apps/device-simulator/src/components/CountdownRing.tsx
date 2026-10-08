import type { ReactNode } from "react";
import { TONE_STROKE, TONE_TEXT, type Tone } from "./tones";

interface CountdownRingProps {
  /** 0..1 of the ring that is still remaining. */
  fraction: number;
  tone: Tone;
  value: ReactNode;
  caption: string;
}

const SIZE = 280;
const STROKE = 18;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function CountdownRing({ fraction, tone, value, caption }: CountdownRingProps) {
  const clamped = Math.min(1, Math.max(0, fraction));

  return (
    <div className="relative" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-gray-100 dark:stroke-gray-700"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - clamped)}
          className={`${TONE_STROKE[tone]} transition-[stroke-dashoffset] duration-500 ease-linear`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-8xl font-bold tabular-nums ${TONE_TEXT[tone]}`}>{value}</span>
        <span className="ring-caption mt-1 text-sm text-gray-500 dark:text-gray-400">
          {caption}
        </span>
      </div>
    </div>
  );
}
