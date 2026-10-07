/**
 * React hook เชื่อมต่อ Mosquitto ผ่าน WebSocket ด้วย mqtt.js
 * - reconnect อัตโนมัติทุก 2 วินาที และรายงานสถานะให้ UI
 * - publish ด้วย qos 1, retain=false (backend ข้าม status ที่ retained)
 * - ถ้ายังไม่เชื่อมต่อ publish จะ reject เพื่อให้ UI บันทึกเป็น failed
 */
import mqtt, { type MqttClient } from "mqtt";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DevicePayload } from "../lib/payloads";

export type ConnectionState = "connecting" | "connected" | "reconnecting" | "offline" | "error";

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
    const client = mqtt.connect(url, {
      clientId: `fallhelp-sim-${Math.random().toString(16).slice(2, 10)}`,
      reconnectPeriod: 2_000,
      connectTimeout: 5_000,
    });
    clientRef.current = client;

    client.on("connect", () => {
      setState("connected");
      setLastError(null);
    });
    client.on("reconnect", () => setState("reconnecting"));
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

  const publish = useCallback(
    (topic: string, payload: DevicePayload): Promise<void> =>
      new Promise((resolve, reject) => {
        const client = clientRef.current;
        if (!client || !client.connected) {
          reject(new Error("Not connected to MQTT broker"));
          return;
        }
        client.publish(topic, JSON.stringify(payload), { qos: 1, retain: false }, (error) => {
          if (error) reject(error);
          else resolve();
        });
      }),
    []
  );

  return { state, lastError, publish };
};
