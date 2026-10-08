/**
 * Dashboard ของ device-simulator: จำลองอุปกรณ์คล้องคอสำหรับการนำเสนอ (เต็มจอ desktop)
 * - Device: online ส่ง status ซ้ำทุก 5 วินาทีเหมือน firmware (แอปถือว่า offline ถ้าเงียบเกิน 15 วินาที)
 * - Heart rate: ส่งอัตโนมัติทุก 5 วินาทีตอน online ค่าขยับสุ่มรอบสถานการณ์ที่เลือก (ต่ำ/ปกติ/สูง)
 *   เปลี่ยนสถานการณ์แล้วค่อยๆ ไต่ขึ้น/ลง และสูงขึ้นหลังล้มแล้วค่อยลด (heartRateSim)
 * - Fall: suspected_fall → ช่วงยกเลิก 15 วินาที (วงนับถอยหลังใหญ่) → fall_confirmed อัตโนมัติ
 *   หรือกด "Cancel on device" เพื่อส่ง fall_cancelled; จากนั้นนับช่วงที่ backend กันเหตุการณ์ซ้ำ
 * - ปุ่มทั้งหมดปิดเมื่อ serial ไม่ถูกต้องหรือยังไม่เชื่อมต่อ broker
 */
import { InboxStackIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useRef, useState } from "react";
import DevicePanel from "./components/DevicePanel";
import FallPanel from "./components/FallPanel";
import Header from "./components/Header";
import HeartRatePanel from "./components/HeartRatePanel";
import MessageLog from "./components/MessageLog";
import type { Tone } from "./components/tones";
import { MQTT_WS_URL } from "./config";
import { useI18n } from "./i18n/useI18n";
import { describeConnection, type ConnectionTone } from "./lib/connectionStatus";
import { describeFallPhase } from "./lib/fallPhase";
import { CANCEL_WINDOW_MS, blockedUntilAfter, type FallOutcome } from "./lib/fallSequence";
import {
  HEART_RATE_PRESETS,
  initialHeartRate,
  nextHeartRate,
  startFallBoost,
  type HeartRateMode,
  type HeartRateSimState,
} from "./lib/heartRateSim";
import { appendLog, type LogEntry } from "./lib/messageLog";
import {
  DEFAULT_SERIAL,
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
import { useTheme } from "./useTheme";

const HEART_RATE_INTERVAL_MS = 5_000;
const STATUS_HEARTBEAT_INTERVAL_MS = 5_000;
const TICK_MS = 250;
const HISTORY_LENGTH = 16;

const CONNECTION_TONE: Record<ConnectionTone, Tone> = {
  ok: "ok",
  pending: "pending",
  error: "danger",
};

export default function App() {
  const { state, lastError, publish } = useMqttClient(MQTT_WS_URL);
  const { theme, toggle: toggleTheme } = useTheme();
  const { t } = useI18n();
  const [serial, setSerial] = useState(DEFAULT_SERIAL);
  const [deviceOnline, setDeviceOnline] = useState(false);
  const [lastStatusAt, setLastStatusAt] = useState<number | null>(null);

  const [heartMode, setHeartMode] = useState<HeartRateMode>("normal");
  const heartModeRef = useRef<HeartRateMode>("normal");
  const [heart, setHeart] = useState<HeartRateSimState>(() =>
    initialHeartRate(HEART_RATE_PRESETS.normal)
  );
  const [lastSentBpm, setLastSentBpm] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const heartRef = useRef(heart);

  const [suspectedAt, setSuspectedAt] = useState<number | null>(null);
  const [blockStartedAt, setBlockStartedAt] = useState<number | null>(null);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const [lastOutcome, setLastOutcome] = useState<FallOutcome | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const [log, setLog] = useState<LogEntry[]>([]);
  const nextId = useRef(1);
  const resolvingFall = useRef(false);

  const connection = describeConnection(state);
  const serialValid = isValidSerial(serial);
  const canSend = serialValid && state === "connected";
  const phase = describeFallPhase({ suspectedAt, blockStartedAt, blockedUntil, lastOutcome, now });
  const timersActive = phase.kind !== "idle";

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

  const updateHeart = (next: HeartRateSimState) => {
    heartRef.current = next;
    setHeart(next);
  };

  const sendHeartRate = useCallback(async () => {
    const next = nextHeartRate(heartRef.current, HEART_RATE_PRESETS[heartModeRef.current]);
    heartRef.current = next;
    setHeart(next);
    if (await send(deviceTopics.heartRate(serial), buildHeartRate(next.bpm, Date.now()))) {
      setLastSentBpm(next.bpm);
      setHistory((values) => [...values, next.bpm].slice(-HISTORY_LENGTH));
    }
  }, [send, serial]);

  const sendStatus = useCallback(
    async (online: boolean) => {
      const at = Date.now();
      const sent = await send(deviceTopics.status(serial), buildStatus(online, at));
      if (sent) setLastStatusAt(at);
      return sent;
    },
    [send, serial]
  );

  const resolveFall = useCallback(
    async (outcome: FallOutcome) => {
      if (suspectedAt === null || resolvingFall.current) return;
      resolvingFall.current = true;
      const resolvedAt = Date.now();
      const payload =
        outcome === "confirmed"
          ? buildFallConfirmed(heartRef.current.bpm, resolvedAt)
          : buildFallCancelled(resolvedAt);
      await send(deviceTopics.event(serial), payload);
      if (outcome === "confirmed") updateHeart(startFallBoost(heartRef.current));
      setLastOutcome(outcome);
      setBlockStartedAt(resolvedAt);
      setBlockedUntil(blockedUntilAfter(outcome, suspectedAt, resolvedAt));
      setSuspectedAt(null);
      setNow(resolvedAt);
      resolvingFall.current = false;
    },
    [send, serial, suspectedAt]
  );

  // Countdown ticker: only runs while the fall ring is counting.
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
    const timer = window.setInterval(() => void sendStatus(true), STATUS_HEARTBEAT_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [deviceOnline, canSend, sendStatus]);

  // Live heart rate every 5 s while the device is online.
  useEffect(() => {
    if (!deviceOnline || !canSend) return;
    const timer = window.setInterval(() => void sendHeartRate(), HEART_RATE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [deviceOnline, canSend, sendHeartRate]);

  const goOnline = async () => {
    if (await sendStatus(true)) {
      setDeviceOnline(true);
      void sendHeartRate();
    }
  };

  const goOffline = async () => {
    setDeviceOnline(false);
    await sendStatus(false);
  };

  const changeHeartMode = (mode: HeartRateMode) => {
    heartModeRef.current = mode;
    setHeartMode(mode);
  };

  const simulateFall = async () => {
    const at = Date.now();
    if (await send(deviceTopics.event(serial), buildSuspectedFall(heartRef.current.bpm, at))) {
      setSuspectedAt(at);
      setNow(at);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 xl:h-screen xl:overflow-hidden text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <Header
        brokerLabel={t.connection[state]}
        brokerTone={CONNECTION_TONE[connection.tone]}
        brokerUrl={MQTT_WS_URL}
        brokerError={state === "connected" ? null : lastError}
        serial={serial}
        serialValid={serialValid}
        serialNotSeeded={serialWarning(serial) !== null}
        onSerialChange={setSerial}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="grid shrink-0 gap-6 p-6 xl:grid-cols-[minmax(280px,1fr)_minmax(420px,1.5fr)_minmax(320px,1.1fr)]">
        <DevicePanel
          online={deviceOnline}
          canSend={canSend}
          lastStatusAt={lastStatusAt}
          onOnline={() => void goOnline()}
          onOffline={() => void goOffline()}
        />
        <FallPanel
          phase={phase}
          canSend={canSend}
          online={deviceOnline}
          onSimulateFall={() => void simulateFall()}
          onCancel={() => void resolveFall("cancelled")}
        />
        <HeartRatePanel
          bpm={lastSentBpm}
          history={history}
          mode={heartMode}
          onModeChange={changeHeartMode}
          live={deviceOnline && canSend}
          boosted={heart.boost > 0}
          intervalMs={HEART_RATE_INTERVAL_MS}
          capacity={HISTORY_LENGTH}
        />
      </main>

      <section className="mx-6 mb-6 flex flex-col overflow-hidden rounded-xl xl:min-h-0 xl:flex-1 border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <header className="flex shrink-0 items-center justify-between px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <InboxStackIcon className="h-5 w-5 text-gray-400" aria-hidden />
            {t.log.title}
          </h2>
          <span className="text-xs text-gray-500">{t.log.count(log.length)}</span>
        </header>
        {/* Only this block scrolls on desktop; the page itself fits the screen */}
        <div className="scroll-thin max-h-72 overflow-y-auto px-3 pb-3 xl:max-h-none xl:min-h-0 xl:flex-1">
          <MessageLog entries={log} />
        </div>
      </section>
    </div>
  );
}
