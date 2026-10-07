#!/usr/bin/env node
/**
 * Demo launcher — เปิด Mosquitto (demo config), backend-api และ device-simulator พร้อมกัน
 * - broker ของ demo ใช้ port 1884 จึงรันคู่กับ Mosquitto service (1883) ได้ ไม่ต้องหยุด service
 * - backend ถูกชี้ไปที่ broker ของ demo ผ่าน env (dotenv ไม่ทับค่า env ที่ส่งมา)
 * - ตรวจ port ว่างก่อน (1884, 9001, 3000, 5175) และบอกวิธีแก้เมื่อชน
 * - ถ้า process ใดเปิดไม่ขึ้นหรือหยุดเอง (แม้ exit 0) จะหยุดทุกตัว; Ctrl+C หยุดทั้งหมด
 * - tunnel ต้องเปิดแยกเอง: npm run demo:tunnel (ดู docs/demo/cloudflare-tunnel.md)
 */
import { spawn, spawnSync } from "node:child_process";
import net from "node:net";
import path from "node:path";
import readline from "node:readline";
import { ROOT, getNpmInvocation } from "../lib/process-helpers.mjs";

const MOSQUITTO_CONF = path.join(ROOT, "config", "mosquitto", "mosquitto.demo.conf");
const DEMO_MQTT_PORT = 1884;

// Point backend-api at the demo broker without touching apps/backend-api/.env.
const BACKEND_ENV = {
  ...process.env,
  MQTT_BROKER_URL: `mqtt://127.0.0.1:${DEMO_MQTT_PORT}`,
  MQTT_USERNAME: "",
  MQTT_PASSWORD: "",
  MQTT_DISABLED: "false",
};

const PORTS = [
  { port: DEMO_MQTT_PORT, owner: "Mosquitto (MQTT)", hint: "Another demo broker is probably still running. Close it first." },
  { port: 9001, owner: "Mosquitto (WebSocket)", hint: "Another broker is already using 9001. Stop it first." },
  { port: 3000, owner: "backend-api", hint: "Run: npm run dev:stop" },
  { port: 5175, owner: "device-simulator", hint: "Close the other simulator dev server." },
];

const canListen = (port, host) =>
  new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => server.close(() => resolve(true)));
    server.listen(port, host);
  });

const isPortFree = async (port) =>
  (await canListen(port, "127.0.0.1")) && (await canListen(port, "0.0.0.0"));

const fail = (message) => {
  console.error(`\x1b[31m✖ ${message}\x1b[0m`);
  process.exit(1);
};

const mosquittoCheck = spawnSync("mosquitto", ["-h"], { stdio: "ignore" });
if (mosquittoCheck.error) {
  fail("mosquitto is not on PATH. Install Mosquitto and add its folder to PATH (see docs/demo/DEMO_GUIDE.md).");
}

for (const { port, owner, hint } of PORTS) {
  if (!(await isPortFree(port))) fail(`Port ${port} (${owner}) is already in use. ${hint}`);
}

const services = [
  { name: "MQTT", color: "\x1b[35m", command: "mosquitto", args: ["-c", MOSQUITTO_CONF, "-v"], cwd: ROOT },
  {
    name: "API",
    color: "\x1b[36m",
    env: BACKEND_ENV,
    ...getNpmInvocation(["run", "debug", "--prefix", "apps/backend-api"]),
  },
  { name: "SIM", color: "\x1b[33m", ...getNpmInvocation(["run", "dev", "--prefix", "apps/device-simulator"]) },
];

const children = [];
let stopping = false;

const killAll = () => {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode !== null || !child.pid) continue;
    if (process.platform === "win32") {
      spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    } else {
      child.kill("SIGTERM");
    }
  }
};

for (const service of services) {
  const child = spawn(service.command, service.args, {
    cwd: service.cwd,
    env: service.env ?? process.env,
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
  });
  children.push(child);
  const prefix = `${service.color}[${service.name}]\x1b[0m `;
  for (const stream of [child.stdout, child.stderr]) {
    readline.createInterface({ input: stream }).on("line", (line) => console.log(prefix + line));
  }
  // Spawn failures (e.g. command not found) emit "error" instead of "exit".
  child.on("error", (error) => {
    if (stopping) return;
    console.error(`${prefix}failed to start: ${error.message}; stopping the demo stack.`);
    killAll();
    process.exitCode = 1;
  });
  // Every service is long-running, so any exit (even code 0) breaks the demo.
  child.on("exit", (code, signal) => {
    if (stopping) return;
    console.error(
      `${prefix}exited (${signal ?? `code ${code}`}); stopping the demo stack.`
    );
    killAll();
    process.exitCode = code || 1;
  });
}

process.on("SIGINT", () => {
  killAll();
  process.exit(0);
});
process.on("SIGTERM", () => {
  killAll();
  process.exit(0);
});

console.log("\n\x1b[32m✔ Demo stack starting\x1b[0m");
console.log("  Simulator : http://127.0.0.1:5175");
console.log("  API       : http://localhost:3000/internal/health");
console.log("  Tunnel    : run `npm run demo:tunnel` in another terminal\n");
