import { Fragment, useState } from "react";
import { useI18n } from "../i18n/useI18n";
import type { Messages } from "../i18n/messages";
import type { LogEntry } from "../lib/messageLog";
import { TONE_BADGE, type Tone } from "./tones";

interface MessageLogProps {
  entries: readonly LogEntry[];
}

const describe = (entry: LogEntry, t: Messages): { label: string; tone: Tone } => {
  const payload = entry.payload as unknown as Record<string, unknown>;
  if (typeof payload["type"] === "string") {
    const type = payload["type"];
    if (type === "fall_confirmed") return { label: type, tone: "danger" };
    if (type === "suspected_fall") return { label: type, tone: "pending" };
    return { label: type, tone: "muted" };
  }
  if (typeof payload["heartRate"] === "number") {
    return { label: t.log.heartRate(payload["heartRate"]), tone: "info" };
  }
  if (typeof payload["online"] === "boolean") {
    return payload["online"]
      ? { label: t.log.statusOnline, tone: "ok" }
      : { label: t.log.statusOffline, tone: "muted" };
  }
  return { label: t.log.other, tone: "muted" };
};

export default function MessageLog({ entries }: MessageLogProps) {
  const { t } = useI18n();
  const [openId, setOpenId] = useState<number | null>(null);

  if (entries.length === 0) {
    return <p className="py-6 text-center text-sm text-gray-400">{t.log.empty}</p>;
  }

  return (
    <table className="w-full text-left text-sm">
      <thead className="sticky top-0 bg-gray-50 text-xs font-semibold text-gray-500 dark:bg-gray-900 dark:text-gray-400">
        <tr>
          <th className="px-3 py-2 font-medium">{t.log.time}</th>
          <th className="px-3 py-2 font-medium">{t.log.message}</th>
          <th className="px-3 py-2 font-medium">{t.log.topic}</th>
          <th className="px-3 py-2 text-right font-medium">{t.log.result}</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => {
          const { label, tone } = describe(entry, t);
          const open = openId === entry.id;
          return (
            <Fragment key={entry.id}>
              <tr
                className="cursor-pointer border-t border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/40"
                onClick={() => setOpenId(open ? null : entry.id)}
              >
                <td className="px-3 py-2 font-mono text-xs text-gray-500 tabular-nums">
                  {new Date(entry.at).toLocaleTimeString(t.locale)}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-medium ring-1 ${TONE_BADGE[tone]}`}
                  >
                    {label}
                  </span>
                </td>
                <td className="px-3 py-2 font-mono text-xs text-gray-500">{entry.topic}</td>
                <td className="px-3 py-2 text-right text-xs">
                  {entry.status === "sent" ? (
                    <span className="text-green-600 dark:text-green-400">{t.log.sent}</span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400" title={entry.error}>
                      {t.log.failed}
                    </span>
                  )}
                </td>
              </tr>
              {open ? (
                <tr className="bg-gray-50 dark:bg-gray-900/60">
                  <td colSpan={4} className="px-3 py-2">
                    {entry.error ? (
                      <p className="mb-1 text-xs text-red-600 dark:text-red-400">{entry.error}</p>
                    ) : null}
                    <pre className="overflow-x-auto font-mono text-xs text-gray-700 dark:text-gray-300">
                      {JSON.stringify(entry.payload, null, 2)}
                    </pre>
                  </td>
                </tr>
              ) : null}
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}
