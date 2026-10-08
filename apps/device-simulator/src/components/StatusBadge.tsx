import { TONE_BADGE, TONE_DOT, type Tone } from "./tones";

interface StatusBadgeProps {
  tone: Tone;
  label: string;
  pulse?: boolean;
}

export default function StatusBadge({ tone, label, pulse = false }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ring-1 ${TONE_BADGE[tone]}`}
    >
      <span className="relative flex h-2.5 w-2.5">
        {pulse ? (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${TONE_DOT[tone]}`}
          />
        ) : null}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${TONE_DOT[tone]}`} />
      </span>
      {label}
    </span>
  );
}
