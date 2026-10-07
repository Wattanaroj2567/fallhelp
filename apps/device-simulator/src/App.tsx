/**
 * หน้าเดียวของ device-simulator: จำลองอุปกรณ์คล้องคอสำหรับการนำเสนอ
 * - เลือก serial, ส่ง status / heart rate / fall / fall_cancelled ไปยัง MQTT topic จริง
 * - ปุ่มทั้งหมดปิดเมื่อ serial ไม่ถูกต้องหรือยังไม่เชื่อมต่อ broker
 * - ปุ่ม Fall มี countdown 30 วินาทีตาม de-dup ของ backend
 */
import { useCallback, useEffect, useRef, useState } from "react";
import MessageLog from "./components/MessageLog";
import { MQTT_WS_URL } from "./config";
import { remainingCooldownMs } from "./lib/cooldown";
import { appendLog, type LogEntry } from "./lib/messageLog";
import {
  DEFAULT_SERIAL,
  HEART_RATE_MAX,
  HEART_RATE_MIN,
  buildFall,
  buildFallCancelled,
  buildHeartRate,
  buildStatus,
  deviceTopics,
  isValidSerial,
  type DevicePayload,
} from "./lib/payloads";
import { useMqttClient, type ConnectionState } from "./mqtt/useMqttClient";

const AUTO_HEART_RATE_INTERVAL_MS = 5_000;

const STATE_STYLES: Record<ConnectionState, string> = {
  connected: "bg-emerald-500",
  connecting: "bg-amber-400",
  reconnecting: "bg-amber-400",
  offline: "bg-slate-500",
  error: "bg-red-500",
};

const buttonClass =
  "rounded-lg px-4 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-40";

export default function App() {
  const { state, lastError, publish } = useMqttClient(MQTT_WS_URL);
  const [serial, setSerial] = useState(DEFAULT_SERIAL);
  const [bpm, setBpm] = useState(78);
  const [autoHeartRate, setAutoHeartRate] = useState(false);
  const [lastFallAt, setLastFallAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [log, setLog] = useState<LogEntry[]>([]);
  const nextId = useRef(1);

  const serialValid = isValidSerial(serial);
  const canSend = serialValid && state === "connected";
  const cooldownMs = remainingCooldownMs(lastFallAt, now);

  const send = useCallback(
    async (topic: string, payload: DevicePayload): Promise<boolean> => {
      const id = nextId.current++;
      try {
        await publish(topic, payload);
        setLog((entries) =>
          appendLog(entries, { id, at: Date.now(), topic, payload, status: "sent" })
        );
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setLog((entries) =>
          appendLog(entries, {
            id,
            at: Date.now(),
            topic,
            payload,
            status: "failed",
            error: message,
          })
        );
        return false;
      }
    },
    [publish]
  );

  useEffect(() => {
    if (lastFallAt === null) return;
    const timer = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(timer);
  }, [lastFallAt]);

  useEffect(() => {
    if (!autoHeartRate || !canSend) return;
    const timer = window.setInterval(() => {
      void send(deviceTopics.heartRate(serial), buildHeartRate(bpm, Date.now()));
    }, AUTO_HEART_RATE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [autoHeartRate, canSend, send, serial, bpm]);

  const sendFall = async () => {
    const sentAt = Date.now();
    const ok = await send(deviceTopics.event(serial), buildFall(bpm, sentAt));
    if (ok) {
      setLastFallAt(sentAt);
      setNow(sentAt);
    }
  };

  return (
    <main className="mx-auto grid max-w-5xl gap-6 p-6 md:grid-cols-2">
      <section className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">FallHelp Device Simulator</h1>
          <p className="text-sm text-slate-400">
            Publishes the same MQTT messages as the ESP32 device.
          </p>
        </header>

        <div className="flex items-center gap-2 text-sm">
          <span className={`h-3 w-3 rounded-full ${STATE_STYLES[state]}`} />
          <span>
            Broker {state} — <code>{MQTT_WS_URL}</code>
          </span>
        </div>
        {lastError ? <p className="text-sm text-red-300">{lastError}</p> : null}

        <label className="block space-y-1">
          <span className="text-sm text-slate-300">Device serial</span>
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono"
            value={serial}
            onChange={(event) => setSerial(event.target.value.trim())}
          />
          {!serialValid ? (
            <span className="text-xs text-red-300">
              Expected format ESP32-XXXXXXXXXXXX (uppercase hex)
            </span>
          ) : null}
        </label>

        <div className="flex gap-3">
          <button
            className={`${buttonClass} bg-emerald-600 hover:bg-emerald-500`}
            disabled={!canSend}
            onClick={() => void send(deviceTopics.status(serial), buildStatus(true, Date.now()))}
          >
            Online
          </button>
          <button
            className={`${buttonClass} bg-slate-600 hover:bg-slate-500`}
            disabled={!canSend}
            onClick={() => void send(deviceTopics.status(serial), buildStatus(false, Date.now()))}
          >
            Offline
          </button>
        </div>

        <div className="space-y-2">
          <label className="flex items-center justify-between text-sm">
            <span>Heart rate: {bpm} BPM</span>
            <input
              type="range"
              min={HEART_RATE_MIN + 40}
              max={HEART_RATE_MAX}
              value={bpm}
              onChange={(event) => setBpm(Number(event.target.value))}
            />
          </label>
          <div className="flex items-center gap-3">
            <button
              className={`${buttonClass} bg-sky-600 hover:bg-sky-500`}
              disabled={!canSend}
              onClick={() =>
                void send(deviceTopics.heartRate(serial), buildHeartRate(bpm, Date.now()))
              }
            >
              Send heart rate
            </button>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoHeartRate}
                onChange={(event) => setAutoHeartRate(event.target.checked)}
              />
              Auto-send every 5 s
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            className={`${buttonClass} bg-red-600 text-lg hover:bg-red-500`}
            disabled={!canSend || cooldownMs > 0}
            onClick={() => void sendFall()}
          >
            {cooldownMs > 0 ? `Simulate Fall (${Math.ceil(cooldownMs / 1000)}s)` : "Simulate Fall"}
          </button>
          <button
            className={`${buttonClass} bg-amber-600 hover:bg-amber-500`}
            disabled={!canSend}
            onClick={() => void send(deviceTopics.event(serial), buildFallCancelled(Date.now()))}
          >
            Acknowledge on device
          </button>
        </div>
        <p className="text-xs text-slate-400">
          The backend ignores repeated falls from the same device within 30 seconds.
        </p>
      </section>

      <section className="max-h-[85vh] overflow-y-auto">
        <h2 className="mb-3 text-lg font-semibold">Sent messages</h2>
        <MessageLog entries={log} />
      </section>
    </main>
  );
}
