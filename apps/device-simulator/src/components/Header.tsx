import { CpuChipIcon, MoonIcon, ServerStackIcon, SunIcon } from "@heroicons/react/24/outline";
import { useI18n } from "../i18n/useI18n";
import { LANGS } from "../i18n/messages";
import type { Theme } from "../lib/theme";
import StatusBadge from "./StatusBadge";
import type { Tone } from "./tones";

interface HeaderProps {
  brokerLabel: string;
  brokerTone: Tone;
  brokerUrl: string;
  brokerError: string | null;
  serial: string;
  serialValid: boolean;
  serialNotSeeded: boolean;
  onSerialChange: (serial: string) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export default function Header(props: HeaderProps) {
  const { brokerLabel, brokerTone, brokerUrl, brokerError, serial, serialValid, serialNotSeeded } =
    props;
  const { lang, t, setLang } = useI18n();

  return (
    <header className="shrink-0 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-wrap items-center justify-between gap-6 px-8 py-3">
        <div className="flex items-center gap-3">
          {/* Same cropped wordmark as the admin navbar */}
          <div className="relative flex h-10 w-23 items-center overflow-hidden">
            <img
              src="/logo.png"
              alt="FallHelp"
              className="absolute top-1/2 -left-1.5 h-28 w-auto -translate-y-1/2 object-contain"
            />
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">{t.header.product}</span>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <ServerStackIcon className="h-5 w-5 text-gray-400" aria-hidden />
            <div className="flex flex-col">
              <StatusBadge
                tone={brokerTone}
                label={t.header.broker(brokerLabel)}
                pulse={brokerTone !== "ok"}
              />
              <code className="mt-0.5 text-xs text-gray-400">{brokerUrl}</code>
              {brokerError ? <span className="text-xs text-red-600">{brokerError}</span> : null}
            </div>
          </div>

          <label className="flex items-center gap-3">
            <CpuChipIcon className="h-5 w-5 text-gray-400" aria-hidden />
            <span className="flex flex-col">
              <input
                aria-label={t.header.serialLabel}
                className={`w-64 rounded-lg border bg-white px-3 py-2 font-mono text-sm tracking-wider text-gray-900 dark:bg-gray-900 dark:text-gray-100 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10 ${
                  serialValid ? "border-gray-200 dark:border-gray-700" : "border-red-500"
                }`}
                value={serial}
                onChange={(event) => props.onSerialChange(event.target.value.trim())}
              />
              {!serialValid ? (
                <span className="text-xs text-red-600">{t.header.serialFormat}</span>
              ) : null}
              {serialNotSeeded ? (
                <span className="max-w-64 text-xs text-amber-600">{t.header.serialNotSeeded}</span>
              ) : null}
            </span>
          </label>

          <div
            role="radiogroup"
            aria-label={t.header.language}
            className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-900"
          >
            {LANGS.map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={lang === value}
                onClick={() => setLang(value)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                  lang === value
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {value.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={props.onToggleTheme}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            aria-label={props.theme === "dark" ? t.header.toLight : t.header.toDark}
            title={props.theme === "dark" ? t.header.toLight : t.header.toDark}
          >
            {props.theme === "dark" ? (
              <SunIcon className="h-6 w-6" aria-hidden />
            ) : (
              <MoonIcon className="h-6 w-6" aria-hidden />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
