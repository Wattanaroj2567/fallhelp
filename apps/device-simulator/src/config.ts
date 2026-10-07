/**
 * ค่าคอนฟิกของ device-simulator
 * - MQTT_WS_URL: broker WebSocket (ค่าเริ่มต้นชี้ Mosquitto บนเครื่องเดียวกัน)
 */
export const MQTT_WS_URL: string = import.meta.env.VITE_MQTT_WS_URL ?? "ws://127.0.0.1:9001";
