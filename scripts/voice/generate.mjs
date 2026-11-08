#!/usr/bin/env node
/**
 * Generates voice-overs with Gemini TTS and saves them where the videos expect them.
 *
 *   npm run voice -- <slug> [<slug> ...]     generate for these videos
 *   npm run voice -- --missing               every src/videos/<slug>/voice.md without a voiceover.mp3
 *   npm run voice -- --list-models           show the TTS models your key can use
 *
 *   npm run voice -- <slug> --from=<file.wav>  use an existing take (or an AI Studio download) as the voice-over
 *
 * Options: --force (replace an existing voiceover.mp3; the old one is backed up to out/voice-takes/),
 *          --takes=N (generate N takes, keep take 1 as voiceover.mp3, the rest in out/voice-takes/),
 *          --dry-run (print the request instead of calling the API).
 *
 * Reads src/videos/<slug>/voice.md (format: references/production.md in the money-mechanism-video skill)
 * and GEMINI_API_KEY / GEMINI_TTS_MODEL from .env. Output: public/videos/<slug>/voiceover.mp3,
 * 44.1 kHz mono MP3 at about −14 LUFS, plus the raw take in out/voice-takes/<slug>/.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const require = createRequire(import.meta.url);
try {
  process.loadEnvFile(path.join(ROOT, ".env"));
} catch {
  /* no .env: fall back to the environment */
}

const API = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta";
const KEY = process.env.GEMINI_API_KEY?.trim();
const SAMPLE_RATE = 24000; // Gemini TTS returns 24 kHz, 16-bit, mono PCM

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name, def) => {
  const a = args.find((x) => x.startsWith(`--${name}=`));
  return a ? a.split("=")[1] : def;
};
const slugs = args.filter((a) => !a.startsWith("--"));

const die = (msg) => {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
};
const needKey = () => {
  if (!KEY || KEY.startsWith("paste")) {
    die(
      "No Gemini API key. Open the .env file in the project folder and put your key after GEMINI_API_KEY= " +
        "(get one at Google AI Studio › Get API key).",
    );
  }
};

async function api(pathname, body) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(`${API}/${pathname}`, {
      method: body ? "POST" : "GET",
      headers: { "x-goog-api-key": KEY, "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.ok) return res.json();
    const text = await res.text();
    if ((res.status === 429 || res.status >= 500) && attempt < 4) {
      const wait = 2 ** attempt * 2000;
      console.log(`  … ${res.status} from Gemini, retrying in ${wait / 1000}s`);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    let msg = text;
    try {
      msg = JSON.parse(text).error?.message ?? text;
    } catch {
      /* not JSON */
    }
    die(`Gemini API error ${res.status}: ${msg}`);
  }
}

async function listTtsModels() {
  const out = [];
  let token = "";
  do {
    const page = await api(`models?pageSize=1000${token ? `&pageToken=${token}` : ""}`);
    out.push(...(page.models ?? []));
    token = page.nextPageToken ?? "";
  } while (token);
  return out.filter((m) => /tts/i.test(m.name)).map((m) => m.name.replace(/^models\//, ""));
}

async function pickModel(spec) {
  if (spec.model) return spec.model;
  if (process.env.GEMINI_TTS_MODEL?.trim()) return process.env.GEMINI_TTS_MODEL.trim();
  const models = await listTtsModels();
  if (!models.length) die("Your key has no TTS models. Run `npm run voice -- --list-models` to check.");
  const lite = (m) => /lite/i.test(m);
  const stable = models.filter((m) => !/preview|exp/i.test(m) && !lite(m));
  const preview = models.filter((m) => !lite(m));
  const ver = (m) => parseFloat(m.match(/(\d+(\.\d+)?)/)?.[1] ?? "0");
  const best = (list) => list.sort((a, b) => ver(b) - ver(a) || (/pro/.test(b) ? 1 : 0) - (/pro/.test(a) ? 1 : 0))[0];
  const chosen = best(stable) ?? best(preview);
  console.log(`  model: ${chosen} (auto; set GEMINI_TTS_MODEL in .env to pin one)`);
  if (/preview|exp/i.test(chosen)) {
    console.log("  ⚠ This is a Preview model. For monetized videos, pin a stable TTS model in .env once one is available to your key.");
  }
  return chosen;
}

/** Parses src/videos/<slug>/voice.md. */
function readSpec(slug) {
  const file = path.join(ROOT, "src", "videos", slug, "voice.md");
  if (!existsSync(file)) die(`Missing ${path.relative(ROOT, file)}. Create it from the calendar row (format: production.md).`);
  const md = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const field = (name) => md.match(new RegExp(`^${name}:\\s*(.+)$`, "mi"))?.[1].trim();
  const section = (name) => {
    const m = md.match(new RegExp(`^##\\s*${name}\\s*\\n([\\s\\S]*?)(?=^##\\s|(?![\\s\\S]))`, "mi"));
    return m ? m[1].replace(/^```\w*\n?|```\s*$/gm, "").trim() : "";
  };
  const spec = { slug, file, model: field("model"), style: section("Style"), script: section("Script") };
  const speakers = field("speakers");
  const voice = field("voice");
  if (speakers) {
    spec.speakers = speakers.split(",").map((p) => {
      const [name, v] = p.split("=").map((x) => x.trim());
      if (!/^[A-Za-z0-9]+$/.test(name) || !v) die(`${slug}: speakers must look like "Maya=Sulafat, Jake=Puck".`);
      return { name, voice: v };
    });
    if (spec.speakers.length !== 2) die(`${slug}: Gemini multi-speaker needs exactly 2 speakers.`);
  } else if (voice) {
    spec.voice = voice;
  } else {
    die(`${slug}: voice.md needs a "voice: Sulafat" line (one speaker) or "speakers: Maya=Sulafat, Jake=Puck" (dialogue).`);
  }
  if (!spec.script) die(`${slug}: voice.md has no "## Script" section.`);

  const placeholders = spec.script.match(/\[[A-Z0-9][A-Z0-9 ,.'’$%&/+-]*\]/g);
  if (placeholders) {
    die(`${slug}: fill in these placeholders before generating (they would be read aloud): ${[...new Set(placeholders)].join(", ")}`);
  }
  if (spec.speakers) {
    const names = new Set(spec.speakers.map((s) => s.name));
    const bad = spec.script
      .split("\n")
      .filter((l) => l.trim() && !names.has(l.split(":")[0].trim()));
    if (bad.length) die(`${slug}: every script line must start with a speaker name (${[...names].join(" or ")}:). Check: "${bad[0].slice(0, 60)}"`);
  }
  return spec;
}

/**
 * Older TTS models (2.5, 3.1) take the dialogue as one text with "Name:" prefixes.
 * Newer ones (3.8+) need one part per line tagged with speechMetadata.speaker, and the
 * style goes in speechMetadata.style (a style sent as text would be read aloud).
 */
const usesTaggedParts = (model) => !!model && !/gemini-(2\.5|3\.1)-/.test(model);

function buildRequest(spec, model) {
  const text = spec.style ? `${spec.style}\n\n#### TRANSCRIPT\n${spec.script}` : spec.script;
  if (spec.speakers && usesTaggedParts(model)) {
    const lines = spec.script.split("\n");
    const parts = [];
    lines.forEach((l, i) => {
      if (!l.trim()) return;
      const idx = l.indexOf(":");
      // A blank line after this one = longer pause; say so in that line's style.
      const pauseAfter = i + 1 < lines.length && !lines[i + 1].trim();
      parts.push({
        text: l.slice(idx + 1).trim(),
        speechMetadata: {
          speaker: l.slice(0, idx).trim(),
          ...(spec.style ? { style: pauseAfter ? `${spec.style}\n\nLeave a longer pause after this line.` : spec.style } : {}),
        },
      });
    });
    return {
      contents: [{ role: "user", parts }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: spec.speakers.map((s) => ({
              speaker: s.name,
              voiceConfig: { prebuiltVoiceConfig: { voiceName: s.voice } },
            })),
          },
          languageCode: "en-US",
        },
      },
    };
  }
  if (!spec.speakers && usesTaggedParts(model) && spec.style) {
    // Single voice on a 3.8+ model: style goes in speechMetadata.style per line (as text it is read aloud).
    const lines = spec.script.split("\n");
    const parts = [];
    lines.forEach((l, i) => {
      if (!l.trim()) return;
      const pauseAfter = i + 1 < lines.length && !lines[i + 1].trim();
      parts.push({
        text: l.trim(),
        speechMetadata: { style: pauseAfter ? `${spec.style}\n\nLeave a longer pause after this line.` : spec.style },
      });
    });
    return {
      contents: [{ role: "user", parts }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: spec.voice } }, languageCode: "en-US" },
      },
    };
  }
  const speechConfig = spec.speakers
    ? {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: spec.speakers.map((s) => ({
            speaker: s.name,
            voiceConfig: { prebuiltVoiceConfig: { voiceName: s.voice } },
          })),
        },
      }
    : { voiceConfig: { prebuiltVoiceConfig: { voiceName: spec.voice } } };
  return {
    contents: [{ role: "user", parts: [{ text }] }],
    generationConfig: { responseModalities: ["AUDIO"], speechConfig: { ...speechConfig, languageCode: "en-US" } },
  };
}

function wav(pcm) {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + pcm.length, 4);
  h.write("WAVEfmt ", 8);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SAMPLE_RATE, 24);
  h.writeUInt32LE(SAMPLE_RATE * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

/** Runs Remotion's bundled ffmpeg (no separate install needed). */
function ffmpeg(ffArgs) {
  const cli = path.join(path.dirname(require.resolve("@remotion/cli/package.json")), "remotion-cli.js");
  const r = spawnSync(process.execPath, [cli, "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", ...ffArgs], {
    stdio: "inherit",
  });
  if (r.status !== 0) die("ffmpeg failed while converting the voice-over (see above).");
}

/** Any audio file → public voiceover.mp3: 44.1 kHz mono MP3, loudness-normalized to about −14 LUFS. */
function toMp3(src, mp3) {
  ffmpeg([
    "-i", src,
    "-af", "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=44100",
    "-ar", "44100", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "192k",
    mp3,
  ]);
}

const stamp = () => new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

async function generate(slug, model) {
  const spec = readSpec(slug);
  const body = buildRequest(spec, model);
  if (flag("dry-run")) {
    console.log(`\n— ${slug} → ${model ?? "(model chosen at run time)"}\n${JSON.stringify(body, null, 2)}`);
    return;
  }
  const outDir = path.join(ROOT, "public", "videos", slug);
  const mp3 = path.join(outDir, "voiceover.mp3");
  if (existsSync(mp3) && !flag("force")) {
    console.log(`• ${slug}: voiceover.mp3 already exists — skipped (use --force to replace it).`);
    return;
  }
  const takesDir = path.join(ROOT, "out", "voice-takes", slug);
  mkdirSync(outDir, { recursive: true });
  mkdirSync(takesDir, { recursive: true });
  const who = spec.speakers ? spec.speakers.map((s) => `${s.name}=${s.voice}`).join(", ") : spec.voice;
  const takes = Math.max(1, parseInt(opt("takes", "1"), 10) || 1);

  const files = [];
  for (let t = 1; t <= takes; t++) {
    console.log(`• ${slug}: generating${takes > 1 ? ` take ${t}/${takes}` : ""} (${who}) …`);
    const res = await api(`models/${model}:generateContent`, body);
    const part = res.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
    if (!part) {
      const why = res.candidates?.[0]?.finishReason ?? res.promptFeedback?.blockReason ?? "no audio in the response";
      die(`${slug}: Gemini returned no audio (${why}). Try again, or shorten / reword the style instructions.`);
    }
    const pcm = Buffer.from(part.inlineData.data, "base64");
    const secs = pcm.length / 2 / SAMPLE_RATE;
    const raw = path.join(takesDir, `${stamp()}-take${t}.wav`);
    writeFileSync(raw, wav(pcm));
    files.push({ raw, secs });
    console.log(`  take ${t}: ${secs.toFixed(1)} s → ${path.relative(ROOT, raw)}`);
  }

  if (existsSync(mp3)) {
    const backup = path.join(takesDir, `${stamp()}-previous-voiceover.mp3`);
    copyFileSync(mp3, backup);
    console.log(`  previous voiceover.mp3 backed up to ${path.relative(ROOT, backup)}`);
  }
  toMp3(files[0].raw, mp3);
  writeFileSync(
    path.join(takesDir, "last-request.json"),
    JSON.stringify({ model, date: new Date().toISOString(), request: body }, null, 2),
  );
  console.log(`✔ ${slug}: ${path.relative(ROOT, mp3)} (${files[0].secs.toFixed(1)} s, −14 LUFS)`);
  if (takes > 1) console.log(`  Prefer another take? npm run voice -- ${slug} --from=${path.relative(ROOT, files[1].raw).replace(/\\/g, "/")}`);
  console.log("  Next: transcribe it to captions.json and re-time the scenes (the skill does this).");
}

// ---------------------------------------------------------------------------
if (flag("list-models")) {
  needKey();
  const models = await listTtsModels();
  console.log(models.length ? `TTS models for your key:\n  ${models.join("\n  ")}` : "No TTS models found for this key.");
  process.exit(0);
}

const from = opt("from");
if (from) {
  if (slugs.length !== 1) die("Use --from with exactly one slug: npm run voice -- <slug> --from=path/to/take.wav");
  const src = path.resolve(ROOT, from);
  if (!existsSync(src)) die(`Can't find ${from}`);
  const outDir = path.join(ROOT, "public", "videos", slugs[0]);
  const mp3 = path.join(outDir, "voiceover.mp3");
  const takesDir = path.join(ROOT, "out", "voice-takes", slugs[0]);
  mkdirSync(outDir, { recursive: true });
  mkdirSync(takesDir, { recursive: true });
  if (existsSync(mp3)) copyFileSync(mp3, path.join(takesDir, `${stamp()}-previous-voiceover.mp3`));
  toMp3(src, mp3);
  console.log(`✔ ${slugs[0]}: ${path.relative(ROOT, mp3)} from ${from} (−14 LUFS). Previous version backed up in ${path.relative(ROOT, takesDir)}.`);
  process.exit(0);
}

let todo = slugs;
if (flag("missing")) {
  const dir = path.join(ROOT, "src", "videos");
  todo = readdirSync(dir).filter(
    (d) =>
      existsSync(path.join(dir, d, "voice.md")) && !existsSync(path.join(ROOT, "public", "videos", d, "voiceover.mp3")),
  );
  if (!todo.length) {
    console.log("Every video with a voice.md already has a voiceover.mp3.");
    process.exit(0);
  }
}
if (!todo.length) {
  console.log("Usage: npm run voice -- <slug> [more slugs] [--force] [--takes=3] | <slug> --from=take.wav | --missing | --list-models | --dry-run");
  process.exit(1);
}

let model;
if (!flag("dry-run")) {
  needKey();
  todo.forEach(readSpec); // check every voice.md before spending any API calls
  if (todo.some((s) => !readSpec(s).model)) model = await pickModel({});
}
for (const slug of todo) {
  const spec = readSpec(slug);
  await generate(slug, spec.model ?? model);
}
