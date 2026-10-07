import type { LogEntry } from "../lib/messageLog";

interface MessageLogProps {
  entries: readonly LogEntry[];
}

export default function MessageLog({ entries }: MessageLogProps) {
  if (entries.length === 0) {
    return <p className="text-sm text-slate-400">No messages sent yet.</p>;
  }

  return (
    <ol className="space-y-2">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className={`rounded-lg border p-3 text-xs ${
            entry.status === "sent" ? "border-slate-700" : "border-red-500/60 bg-red-950/30"
          }`}
        >
          <div className="mb-1 flex justify-between gap-4 font-mono">
            <span className="text-sky-300">{entry.topic}</span>
            <span className="text-slate-400">{new Date(entry.at).toLocaleTimeString()}</span>
          </div>
          {entry.error ? <p className="mb-1 text-red-300">{entry.error}</p> : null}
          <pre className="overflow-x-auto text-slate-200">
            {JSON.stringify(entry.payload, null, 2)}
          </pre>
        </li>
      ))}
    </ol>
  );
}
