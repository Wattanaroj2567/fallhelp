/**
 * React hook เชื่อมต่อ Mosquitto ผ่าน WebSocket ด้วย mqtt.js
 * - reconnect อัตโนมัติทุก 2 วินาที และรายงานสถานะให้ UI (close/offline = หลุด)
 * - URL ผิดรูปแบบจะไม่ทำให้หน้าขาว แต่แสดงเป็นสถานะ error
 * - publish ด้วย qos 1, retain=false (backend ข้าม status ที่ retained) และ timeout 3 วินาที
 * - ถ้ายังไม่เชื่อมต่อ publish จะ reject เพื่อให้ UI บันทึกเป็น failed
 */
import mqtt, { type MqttClient } from "mqtt";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ConnectionState } from "../lib/connectionStatus";
import type { DevicePayload } from "../lib/payloads";
import { withTimeout } from "../lib/withTimeout";

export type { ConnectionState } from "../lib/connectionStatus";

const PUBLISH_TIMEOUT_MS = 3_000;

export interface MqttClientApi {
  state: ConnectionState;
  lastError: string | null;
  publish: (topic: string, payload: DevicePayload) => Promise<void>;
}

export const useMqttClient = (url: string): MqttClientApi => {
  const clientRef = useRef<MqttClient | null>(null);
  const [state, setState] = useState<ConnectionState>("connecting");
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    let client: MqttClient;
    try {
      client = mqtt.connect(url, {
        clientId: `fallhelp-sim-${Math.random().toString(16).slice(2, 10)}`,
        reconnectPeriod: 2_000,
        connectTimeout: 5_000,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      queueMicrotask(() => {
        setState("error");
        setLastError(`Invalid broker URL "${url}": ${message}`);
      });
      return;
    }
    clientRef.current = client;

    client.on("connect", () => {
      setState("connected");
      setLastError(null);
    });
    client.on("reconnect", () => setState("reconnecting"));
    client.on("close", () => setState("offline"));
    client.on("offline", () => setState("offline"));
    client.on("error", (error) => {
      setState("error");
      setLastError(error.message);
    });

    return () => {
      client.end(true);
      clientRef.current = null;
    };
  }, [url]);

  const publish = useCallback((topic: string, payload: DevicePayload): Promise<void> => {
    const client = clientRef.current;
    if (!client || !client.connected) {
      return Promise.reject(new Error("Not connected to MQTT broker"));
    }
    const sent = new Promise<void>((resolve, reject) => {
      client.publish(topic, JSON.stringify(payload), { qos: 1, retain: false }, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
    return withTimeout(sent, PUBLISH_TIMEOUT_MS, "Publish timed out (broker not responding)");
  }, []);

  return { state, lastError, publish };
};
