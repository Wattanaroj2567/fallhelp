#!/usr/bin/env node
/**
 * จับภาพหน้าจอแอปมือถือทุกหน้าผ่าน adb สำหรับ README
 * - หน้าที่เข้าได้ด้วย deep link (mobile://<route>) จะเปิดและจับภาพอัตโนมัติ
 * - หน้าที่ต้องจัดสถานะเอง (login/register/fall alert) ใช้โหมด manual: รอกด Enter แล้วจับภาพ
 * - ใช้: npm run demo:screenshots [-- --only 03-dashboard]
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { ROOT } from "../lib/process-helpers.mjs";

const PACKAGE = "com.fallhelp.mobile";
const OUT_DIR = path.join(ROOT, "docs", "screenshots");
const SETTLE_MS = 2500;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

const SHOTS = [
  { name: "01-login", hint: "Log out, then open the Login screen." },
  { name: "02-register", hint: "Open the Register screen." },
  { name: "03-dashboard", route: "dashboard", hint: "Log in as demo@fallhelp.app before continuing." },
  { name: "04-history", route: "history" },
  { name: "05-notifications", route: "notifications" },
  { name: "06-device-info", route: "device-info" },
  { name: "07-elder-info", route: "elder-info" },
  { name: "08-emergency-contacts", route: "contacts" },
  { name: "09-report-summary", route: "report-summary" },
  { name: "10-profile", route: "profile-info" },
  { name: "11-fall-alert", hint: "Press 'Simulate Fall' in the simulator and wait for the alert on the phone." },
];

const adb = (args, options = {}) => spawnSync("adb", args, { maxBuffer: 64 * 1024 * 1024, ...options });

const fail = (message) => {
  console.error(`✖ ${message}`);
  process.exit(1);
};

const devices = adb(["devices"], { encoding: "utf8" });
if (devices.error) fail("adb not found on PATH.");
const attached = devices.stdout
  .split("\n")
  .slice(1)
  .filter((line) => line.trim().endsWith("\tdevice"));
if (attached.length !== 1) fail(`Expected exactly one adb device, found ${attached.length}.`);

const packages = adb(["shell", "pm", "list", "packages", PACKAGE], { encoding: "utf8" });
if (!packages.stdout.includes(PACKAGE)) fail(`${PACKAGE} is not installed on the device.`);

const onlyIndex = process.argv.indexOf("--only");
const only = onlyIndex === -1 ? null : process.argv[onlyIndex + 1];
const shots = only ? SHOTS.filter((shot) => shot.name === only) : SHOTS;
if (shots.length === 0) fail(`Unknown shot: ${only}`);

fs.mkdirSync(OUT_DIR, { recursive: true });
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

for (const shot of shots) {
  if (shot.hint) await rl.question(`\n[${shot.name}] ${shot.hint}\nPress Enter to continue… `);
  if (shot.route) {
    const open = adb(
      ["shell", "am", "start", "-W", "-a", "android.intent.action.VIEW", "-d", `mobile://${shot.route}`, PACKAGE],
      { encoding: "utf8" }
    );
    if (open.status !== 0) fail(`Could not open mobile://${shot.route}: ${open.stderr}`);
    await sleep(SETTLE_MS);
  }
  const capture = adb(["exec-out", "screencap", "-p"]);
  if (capture.status !== 0 || !capture.stdout.subarray(0, 4).equals(PNG_SIGNATURE)) {
    fail(`Screen capture failed for ${shot.name}.`);
  }
  const file = path.join(OUT_DIR, `${shot.name}.png`);
  fs.writeFileSync(file, capture.stdout);
  console.log(`✔ ${path.relative(ROOT, file)}`);
}

rl.close();
