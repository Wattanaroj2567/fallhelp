import type { ComponentType, ReactNode, SVGProps } from "react";
import { TONE_TILE, type Tone } from "./tones";

interface PanelProps {
  title: string;
  subtitle?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  iconTone?: Tone;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}

export default function Panel({
  title,
  subtitle,
  icon: Icon,
  iconTone = "muted",
  aside,
  className = "",
  children,
}: PanelProps) {
  return (
    <section
      className={`flex flex-col rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 ${className}`}
    >
      <header className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${TONE_TILE[iconTone]}`}
          >
            <Icon className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
            {subtitle ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {aside}
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </section>
  );
}
