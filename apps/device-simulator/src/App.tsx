/**
 * หน้าเดียวของ device-simulator: จำลองอุปกรณ์คล้องคอสำหรับการนำเสนอ
 * - Online ส่ง status ซ้ำทุก 5 วินาทีเหมือน firmware (มือถือถือว่า offline ถ้าเงียบเกิน 15 วินาที)
 * - Simulate Fall: suspected_fall → ช่วงยกเลิก 15 วินาที → fall_confirmed อัตโนมัติ
 *   หรือกด "Cancel on device" ภายในช่วงนั้นเพื่อส่ง fall_cancelled (ผู้สวมใส่ยกเลิกเอง)
 * - ปุ่มทั้งหมดปิดเมื่อ serial ไม่ถูกต้องหรือยังไม่เชื่อมต่อ broker
 */
import { useCallback, useEffect, useRef, useState } from "react";
import MessageLog from "./components/MessageLog";
import { MQTT_WS_URL } from "./config";
import { describeConnection, type ConnectionTone } from "./lib/connectionStatus";
import {
  CANCEL_WINDOW_MS,
  blockedUntilAfter,
  cancelWindowRemainingMs,
  type FallOutcome,
} from "./lib/fallSequence";
import { appendLog, type LogEntry } from "./lib/messageLog";
import {
  DEFAULT_SERIAL,
  HEART_RATE_MAX,
  HEART_RATE_MIN,
  buildFallCancelled,
  buildFallConfirmed,
  buildHeartRate,
  buildStatus,
  buildSuspectedFall,
  deviceTopics,
  isValidSerial,
  serialWarning,
  type DevicePayload,
} from "./lib/payloads";
import { useMqttClient } from "./mqtt/useMqttClient";

const AUTO_HEART_RATE_INTERVAL_MS = 5_000;
const STATUS_HEARTBEAT_INTERVAL_MS = 5_000;
const TICK_MS = 500;

const TONE_STYLES: Record<ConnectionTone, string> = {
  ok: "bg-emerald-500",
  pending: "bg-amber-400",
  error: "bg-red-500",
};

const buttonClass =
  "rounded-lg px-4 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-40";

export default function App() {
  const { state, lastError, publish } = useMqttClient(MQTT_WS_URL);
  const [serial, setSerial] = useState(DEFAULT_SERIAL);
  const [bpm, setBpm] = useState(78);
  const [deviceOnline, setDeviceOnline] = useState(false);
  const [autoHeartRate, setAutoHeartRate] = useState(false);
  const [suspectedAt, setSuspectedAt] = useState<number | null>(null);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [log, setLog] = useState<LogEntry[]>([]);
  const nextId = useRef(1);
  const resolvingFall = useRef(false);

  const connection = describeConnection(state);
  const serialValid = isValidSerial(serial);
  const warning = serialWarning(serial);
  const canSend = serialValid && state === "connected";
  const cancelRemainingMs = cancelWindowRemainingMs(suspectedAt, now);
  const blockedRemainingMs = blockedUntil === null ? 0 : Math.max(0, blockedUntil - now);
  const timersActive = suspectedAt !== null || blockedRemainingMs > 0;

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

  const resolveFall = useCallback(
    async (outcome: FallOutcome) => {
      if (suspectedAt === null || resolvingFall.current) return;
      resolvingFall.current = true;
      const resolvedAt = Date.now();
      const payload =
        outcome === "confirmed"
          ? buildFallConfirmed(bpm, resolvedAt)
          : buildFallCancelled(resolvedAt);
      await send(deviceTopics.event(serial), payload);
      setBlockedUntil(blockedUntilAfter(outcome, suspectedAt, resolvedAt));
      setSuspectedAt(null);
      setNow(resolvedAt);
      resolvingFall.current = false;
    },
    [bpm, send, serial, suspectedAt]
  );

  // Countdown ticker: only runs while a cancel window or a de-dup block is active.
  useEffect(() => {
    if (!timersActive) return;
    const timer = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(timer);
  }, [timersActive]);

  // Auto-confirm when the device cancel window ends without a cancel.
  useEffect(() => {
    if (suspectedAt === null) return;
    const delay = Math.max(0, suspectedAt + CANCEL_WINDOW_MS - Date.now());
    const timer = window.setTimeout(() => void resolveFall("confirmed"), delay);
    return () => window.clearTimeout(timer);
  }, [suspectedAt, resolveFall]);

  // Status heartbeat like the firmware, so the app keeps the device online.
  useEffect(() => {
    if (!deviceOnline || !canSend) return;
    const timer = window.setInterval(() => {
      void send(deviceTopics.status(serial), buildStatus(true, Date.now()));
    }, STATUS_HEARTBEAT_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [deviceOnline, canSend, send, serial]);

  useEffect(() => {
    if (!autoHeartRate || !canSend) return;
    const timer = window.setInterval(() => {
      void send(deviceTopics.heartRate(serial), buildHeartRate(bpm, Date.now()));
    }, AUTO_HEART_RATE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [autoHeartRate, canSend, send, serial, bpm]);

  const goOnline = async () => {
    if (await send(deviceTopics.status(serial), buildStatus(true, Date.now()))) {
      setDeviceOnline(true);
    }
  };

  const goOffline = async () => {
    setDeviceOnline(false);
    await send(deviceTopics.status(serial), buildStatus(false, Date.now()));
  };

  const simulateFall = async () => {
    const at = Date.now();
    if (await send(deviceTopics.event(serial), buildSuspectedFall(bpm, at))) {
      setSuspectedAt(at);
      setNow(at);
    }
  };

  const fallLabel =
    suspectedAt !== null
      ? `Confirming in ${Math.ceil(cancelRemainingMs / 1000)}s…`
      : blockedRemainingMs > 0
        ? `Simulate Fall (${Math.ceil(blockedRemainingMs / 1000)}s)`
        : "Simulate Fall";

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
          <span className={`h-3 w-3 rounded-full ${TONE_STYLES[connection.tone]}`} />
          <span>
            Broker: {connection.label} — <code>{MQTT_WS_URL}</code>
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
          {warning ? <span className="text-xs text-amber-300">{warning}</span> : null}
        </label>

        <div className="space-y-2">
          <div className="flex gap-3">
            <button
              className={`${buttonClass} bg-emerald-600 hover:bg-emerald-500`}
              disabled={!canSend || deviceOnline}
              onClick={() => void goOnline()}
            >
              Online
            </button>
            <button
              className={`${buttonClass} bg-slate-600 hover:bg-slate-500`}
              disabled={!canSend || !deviceOnline}
              onClick={() => void goOffline()}
            >
              Offline
            </button>
          </div>
          <p className="text-xs text-slate-400">
            {deviceOnline
              ? "Device online: sending status every 5 s."
              : "Device offline: the app ignores heart rate until the device is online."}
          </p>
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

        <div className="space-y-2">
          <div className="flex gap-3">
            <button
              className={`${buttonClass} bg-red-600 text-lg hover:bg-red-500`}
              disabled={!canSend || suspectedAt !== null || blockedRemainingMs > 0}
              onClick={() => void simulateFall()}
            >
              {fallLabel}
            </button>
            <button
              className={`${buttonClass} bg-amber-600 hover:bg-amber-500`}
              disabled={!canSend || suspectedAt === null}
              onClick={() => void resolveFall("cancelled")}
            >
              Cancel on device (false alarm)
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Like the real device: a fall is confirmed 15 s after detection unless the wearer cancels
            it. The backend ignores repeated falls for a short time afterwards.
          </p>
        </div>
      </section>

      <section className="max-h-[85vh] overflow-y-auto">
        <h2 className="mb-3 text-lg font-semibold">Sent messages</h2>
        <MessageLog entries={log} />
      </section>
    </main>
  );
}
