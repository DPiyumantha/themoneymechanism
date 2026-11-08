#!/usr/bin/env node
/**
 * Voice-over → speaker-tagged captions.json, for videos whose dialogue is known (voice.md).
 *
 *   npm run align -- <slug>            ask Gemini for line/word times, snap them to the pauses, write captions.json
 *   npm run align -- <slug> --cached   reuse the last Gemini answer (out/voice-takes/<slug>/align.json, hand-editable)
 *
 * How: Gemini (a text model with audio input) gives rough start/end times per line and a start per word.
 * Remotion's bundled ffmpeg finds the real pauses (silencedetect). Each line then starts on the first
 * stretch of speech after the previous line that Gemini's time falls in, ends on a pause, and every pause
 * inside a line moves the nearest word onto the moment speech resumes. Check the printed table; fix a
 * line by editing align.json and re-running with --cached.
 *
 * Needs GEMINI_API_KEY in .env. Model: GEMINI_ALIGN_MODEL in .env, else gemini-3.8-flash.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const require = createRequire(import.meta.url);
if (existsSync(path.join(ROOT, ".env"))) process.loadEnvFile(path.join(ROOT, ".env"));
const API = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta";
const KEY = process.env.GEMINI_API_KEY?.trim();
const MODEL = process.env.GEMINI_ALIGN_MODEL || "gemini-3.8-flash";

const die = (msg) => {
  console.error(`✖ ${msg}`);
  process.exit(1);
};
const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith("--"));
if (!slug) die("Usage: npm run align -- <slug> [--cached]");
const cached = args.includes("--cached");

// ── dialogue from voice.md ─────────────────────────────────────────────────
const voiceFile = path.join(ROOT, "src", "videos", slug, "voice.md");
if (!existsSync(voiceFile)) die(`${slug}: no voice.md`);
const script = readFileSync(voiceFile, "utf8").split(/^## Script\s*$/m)[1];
if (!script) die(`${slug}: voice.md has no "## Script" section`);
const lines = script
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("<!--"))
  .map((l) => {
    const m = l.match(/^([A-Za-z0-9]+):\s*(.+)$/);
    return m ? { speaker: m[1], text: m[2] } : { speaker: undefined, text: l };
  });
const mp3 = path.join(ROOT, "public", "videos", slug, "voiceover.mp3");
if (!existsSync(mp3)) die(`${slug}: no public/videos/${slug}/voiceover.mp3 — run npm run voice -- ${slug} first`);

// ── pauses (Remotion's bundled ffmpeg) ──────────────────────────────────────
const cli = path.join(path.dirname(require.resolve("@remotion/cli/package.json")), "remotion-cli.js");
const ff = spawnSync(process.execPath, [cli, "ffmpeg", "-hide_banner", "-i", mp3, "-af", "silencedetect=noise=-38dB:d=0.18", "-f", "null", "-"], {
  encoding: "utf8",
});
const log = `${ff.stdout}\n${ff.stderr}`;
const dur = (() => {
  const m = log.match(/Duration: (\d+):(\d+):([\d.]+)/);
  return m ? +m[1] * 3600 + +m[2] * 60 + +m[3] : die("could not read the voice-over duration");
})();
const segs = []; // speech stretches [start, end] in seconds
let cur = 0;
for (const m of log.matchAll(/silence_(start|end): ([\d.]+)/g)) {
  const t = +m[2];
  if (m[1] === "start") {
    if (t - cur > 0.05) segs.push([cur, t]);
  } else cur = t;
}
if (dur - cur > 0.05) segs.push([cur, dur]);

// ── rough times from Gemini ─────────────────────────────────────────────────
const outDir = path.join(ROOT, "out", "voice-takes", slug);
mkdirSync(outDir, { recursive: true });
const alignFile = path.join(outDir, "align.json");
let rough;
if (cached) {
  if (!existsSync(alignFile)) die(`no ${path.relative(ROOT, alignFile)} yet — run without --cached first`);
  rough = JSON.parse(readFileSync(alignFile, "utf8"));
} else {
  if (!KEY) die("No GEMINI_API_KEY in .env");
  const prompt =
    `This audio is a dialogue. Its lines, in order:\n${lines.map((l, i) => `${i + 1}. ${l.speaker ? `${l.speaker}: ` : ""}${l.text}`).join("\n")}\n\n` +
    `For every line give the time it starts and ends in the audio, in seconds with two decimals, and the start time of each of its words ` +
    `(words split on spaces, speaker name not included). Reply with JSON only: [{"line":1,"start":0.00,"end":0.00,"words":[0.00,...]}, ...]`;
  const res = await fetch(`${API}/models/${MODEL}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ inlineData: { mimeType: "audio/mp3", data: readFileSync(mp3).toString("base64") } }, { text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0 },
    }),
  });
  const j = await res.json();
  if (!res.ok) die(`Gemini ${res.status}: ${j.error?.message ?? "error"}`);
  const text = j.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("");
  try {
    rough = JSON.parse(text);
  } catch {
    die(`Gemini did not return JSON:\n${text}`);
  }
  writeFileSync(alignFile, JSON.stringify(rough, null, 1));
}
if (!Array.isArray(rough) || rough.length !== lines.length) die(`Gemini returned ${rough?.length} lines, voice.md has ${lines.length}`);

// ── snap to the pauses ─────────────────────────────────────────────────────
const lerp = (x, [a, b], [c, d]) => c + ((x - a) * (d - c)) / (b - a || 1e-6);
const captions = [];
const report = [];
let prevEnd = 0;
lines.forEach((line, i) => {
  const g = rough[i];
  const words = line.text.split(/\s+/);
  const nextStart = rough[i + 1]?.start ?? dur + 1;
  const gEnd = Math.min(g.end, nextStart);
  const after = segs.filter((s) => s[0] >= prevEnd - 0.01);
  const first = after.find((s) => s[1] > g.start - 0.2) ?? after[0] ?? [prevEnd, dur];
  const s = first[0];
  const inLine = after.filter((x) => x[0] >= s && x[0] < gEnd - 0.1);
  const e = inLine.length ? inLine[inLine.length - 1][1] : first[1];

  let ws = Array.isArray(g.words) && g.words.length === words.length ? [...g.words] : words.map((_, k) => g.start + ((g.end - g.start) * k) / words.length);
  ws = ws.map((t) => lerp(t, [g.start, g.end], [s, e]));
  ws[0] = s;
  // each pause inside the line: the word nearest its middle starts when speech resumes
  const inner = segs.map((x, j) => j).filter((j) => j > 0 && segs[j][0] > s + 0.05 && segs[j][0] < e - 0.05);
  for (const j of inner) {
    if (words.length < 2) break;
    const a = segs[j - 1][1];
    const b = segs[j][0];
    // speech usually resumes after punctuation ("now. Before"), so those words get a head start
    const score = (k) => Math.abs(ws[k] - (a + b) / 2) - (/[.,!?…;:]$/.test(words[k - 1]) ? 0.6 : 0);
    let bk = 1;
    for (let k = 1; k < ws.length; k++) if (score(k) < score(bk)) bk = k;
    ws[bk] = b;
    for (let k = bk - 1; k > 0; k--) ws[k] = Math.min(ws[k], a - 0.1 * (bk - k));
    for (let k = bk + 1; k < ws.length; k++) ws[k] = Math.max(ws[k], b + 0.1 * (k - bk));
  }
  for (let k = 1; k < ws.length; k++) ws[k] = Math.max(ws[k], ws[k - 1] + 0.08);

  words.forEach((w, k) => {
    let we = k + 1 < words.length ? ws[k + 1] : e;
    const pause = segs.find((x) => x[1] > ws[k] && x[1] < we); // a pause starts before the next word
    if (pause) we = pause[1];
    const st = Math.round(ws[k] * 1000);
    const en = Math.max(st + 60, Math.round(we * 1000));
    captions.push({ text: k === 0 ? w : ` ${w}`, startMs: st, endMs: en, timestampMs: Math.round((st + en) / 2), confidence: 0.9, ...(line.speaker ? { speaker: line.speaker } : {}) });
  });
  report.push(`${s.toFixed(2).padStart(6)}–${e.toFixed(2).padEnd(6)} ${line.speaker ? `${line.speaker}: ` : ""}${words.map((w, k) => `${w}@${ws[k].toFixed(2)}`).join(" ")}`);
  prevEnd = e;
});

const out = path.join(ROOT, "src", "videos", slug, "captions.json");
writeFileSync(out, `${JSON.stringify(captions, null, 2)}\n`);
console.log(report.join("\n"));
console.log(`\nspeech stretches: ${segs.map(([a, b]) => `${a.toFixed(2)}–${b.toFixed(2)}`).join("  ")}`);
console.log(`✔ ${path.relative(ROOT, out)} (${captions.length} words, ${dur.toFixed(1)} s). Check each line starts where its speaker does.`);
