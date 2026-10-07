#!/usr/bin/env node
/**
 * ตรวจเอกสารสองภาษา (X.md = English, X.th.md = ไทย)
 * - เอกสารในขอบเขตทุกไฟล์ต้องมีคู่ภาษาไทย/อังกฤษ
 * - ทั้งสองฉบับต้องมีบรรทัดสลับภาษา [English](X.md) · [ภาษาไทย](X.th.md)
 * - ลำดับระดับหัวข้อ, จำนวนแถวของทุกตาราง และจำนวนลิงก์ต้องเท่ากัน
 * - code block ต้องตรงกันทุกบรรทัด ยกเว้นบรรทัดที่มีภาษาไทย (comment/label ที่แปล)
 * - เพื่อจับกรณีเพิ่ม/แก้เนื้อหาในภาษาเดียว
 * ไม่ตรวจ docs/ai (เอกสารสำหรับ AI ภาษาอังกฤษอย่างเดียว)
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

const THAI = /\p{Script=Thai}/u;

// โครงสร้างที่ต้องตรงกันทั้งสองภาษา (ไม่สนคำแปล)
function structure(text) {
  const headings = [];
  const codeBlocks = [];
  const tables = [];
  let links = 0;
  let fence = null;
  let inTable = false;
  for (const line of text.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      if (fence) {
        codeBlocks.push(fence);
        fence = null;
      } else {
        fence = { lang: line.trim().replace(/^(```|~~~)/, ""), lines: [] };
      }
      inTable = false;
      continue;
    }
    if (fence) {
      fence.lines.push(line);
      continue;
    }
    const heading = /^(#{1,6})\s/.exec(line);
    if (heading) headings.push(heading[1].length);
    const isTableRow = /^\s*\|.*\|\s*$/.test(line);
    if (isTableRow && !inTable) tables.push(0);
    if (isTableRow) tables[tables.length - 1]++;
    inTable = isTableRow;
    links += (line.match(/\]\([^)\s]+[^)]*\)/g) ?? []).length;
  }
  return { headings, codeBlocks, tables, links };
}

function compare(en, th) {
  const problems = [];
  if (en.headings.join() !== th.headings.join()) {
    problems.push(`heading levels differ (EN ${en.headings.length}, TH ${th.headings.length})`);
  }
  if (en.tables.join() !== th.tables.join()) {
    problems.push(`table rows differ (EN [${en.tables}], TH [${th.tables}])`);
  }
  if (en.links !== th.links) problems.push(`link count differs (EN ${en.links}, TH ${th.links})`);
  if (en.codeBlocks.length !== th.codeBlocks.length) {
    problems.push(`code block count differs (EN ${en.codeBlocks.length}, TH ${th.codeBlocks.length})`);
    return problems;
  }
  en.codeBlocks.forEach((block, i) => {
    const other = th.codeBlocks[i];
    if (block.lang !== other.lang || block.lines.length !== other.lines.length) {
      problems.push(`code block #${i + 1} differs in language or line count`);
      return;
    }
    // Lines with Thai text (translated comments/labels) may differ; everything else must match.
    const changed = block.lines.findIndex(
      (line, j) => !THAI.test(other.lines[j]) && !THAI.test(line) && line !== other.lines[j]
    );
    if (changed !== -1) problems.push(`code block #${i + 1} line ${changed + 1} differs`);
  });
  return problems;
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
  for (const problem of compare(structure(enText), structure(thText))) {
    errors.push(`${en} ↔ ${thName}: ${problem}`);
  }
}

if (errors.length > 0) {
  console.error(`Bilingual docs check: ${errors.length} problem(s)`);
  for (const error of errors) console.error(`  - ${error}`);
  console.error("Update both X.md (English) and X.th.md (Thai) together.");
  process.exit(1);
}
console.log(`Bilingual docs check: ${pairs} EN/TH pairs in sync`);
