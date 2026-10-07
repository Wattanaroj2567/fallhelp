#!/usr/bin/env node
/**
 * ตรวจเอกสารสองภาษา (X.md = English, X.th.md = ไทย)
 * - เอกสารในขอบเขตทุกไฟล์ต้องมีคู่ภาษาไทย/อังกฤษ
 * - ทั้งสองฉบับต้องมีบรรทัดสลับภาษา [English](X.md) · [ภาษาไทย](X.th.md)
 * - จำนวนหัวข้อ, code block และตารางต้องเท่ากัน เพื่อจับกรณีแก้ภาษาเดียว
 * ไม่ตรวจ docs/ai (เอกสารสำหรับ AI ภาษาอังกฤษอย่างเดียว) และ root README (ฉบับไทยเป็นแบบย่อ)
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "../lib/process-helpers.mjs";

const SCOPE_DIRS = [
  { dir: "docs", recursive: true },
  { dir: "apps/admin", recursive: false },
  { dir: "apps/backend-api", recursive: false },
  { dir: "apps/backend-api/docs", recursive: false },
  { dir: "apps/device-simulator", recursive: false },
  { dir: "apps/mobile", recursive: false },
  { dir: "firmware/esp32", recursive: false },
  { dir: "firmware/esp32/docs", recursive: true },
  { dir: "firmware/esp32/fall_detection_sensor_lab", recursive: false },
];
const EXCLUDED_DIRS = new Set(["docs/ai", "docs/superpowers", "docs/screenshots"]);
// Root README.th.md is a short summary, so only existence is required there.
const EXISTENCE_ONLY = new Set(["README.md"]);

const toPosix = (p) => p.split(path.sep).join("/");

function listMarkdown(relDir, recursive, out = []) {
  const abs = path.join(ROOT, relDir);
  if (!fs.existsSync(abs)) return out;
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = toPosix(path.join(relDir, entry.name));
    if (entry.isDirectory()) {
      if (recursive && !EXCLUDED_DIRS.has(rel)) listMarkdown(rel, recursive, out);
    } else if (entry.name.endsWith(".md")) {
      out.push(rel);
    }
  }
  return out;
}

function structure(text) {
  let headings = 0;
  let codeBlocks = 0;
  let tables = 0;
  let inFence = false;
  let inTable = false;
  for (const line of text.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      if (!inFence) codeBlocks++;
      inFence = !inFence;
      inTable = false;
      continue;
    }
    if (inFence) continue;
    if (/^#{1,6}\s/.test(line)) headings++;
    const isTableRow = /^\s*\|.*\|\s*$/.test(line);
    if (isTableRow && !inTable) tables++;
    inTable = isTableRow;
  }
  return { headings, codeBlocks, tables };
}

const hasSwitchLine = (text, enName, thName) =>
  text.includes(`[English](${enName})`) && text.includes(`[ภาษาไทย](${thName})`);

const files = new Set([
  "README.md",
  "README.th.md",
  ...SCOPE_DIRS.flatMap(({ dir, recursive }) => listMarkdown(dir, recursive)),
]);
const errors = [];
let pairs = 0;

for (const file of files) {
  const isThai = file.endsWith(".th.md");
  const en = isThai ? file.replace(/\.th\.md$/, ".md") : file;
  const th = isThai ? file : file.replace(/\.md$/, ".th.md");
  if (!files.has(en)) errors.push(`${file}: missing English sibling ${en}`);
  if (!files.has(th)) errors.push(`${file}: missing Thai sibling ${th}`);
  if (isThai || !files.has(th)) continue;

  pairs++;
  const enText = fs.readFileSync(path.join(ROOT, en), "utf8");
  const thText = fs.readFileSync(path.join(ROOT, th), "utf8");
  const enName = path.basename(en);
  const thName = path.basename(th);
  for (const [name, text] of [[en, enText], [th, thText]]) {
    if (!hasSwitchLine(text, enName, thName)) {
      errors.push(`${name}: missing language switch [English](${enName}) · [ภาษาไทย](${thName})`);
    }
  }
  if (EXISTENCE_ONLY.has(en)) continue;

  const a = structure(enText);
  const b = structure(thText);
  for (const key of Object.keys(a)) {
    if (a[key] !== b[key]) {
      errors.push(`${en} ↔ ${thName}: ${key} differ (EN ${a[key]}, TH ${b[key]})`);
    }
  }
}

if (errors.length > 0) {
  console.error(`Bilingual docs check: ${errors.length} problem(s)`);
  for (const error of errors) console.error(`  - ${error}`);
  console.error("Update both X.md (English) and X.th.md (Thai) together.");
  process.exit(1);
}
console.log(`Bilingual docs check: ${pairs} EN/TH pairs in sync`);
