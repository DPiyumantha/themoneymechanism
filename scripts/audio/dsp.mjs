// Tiny DSP toolkit for generating The Money Mechanism's original music and SFX.
// No samples, no third-party audio: every sound is synthesized from math.
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

export const SR = 44100;

/** Seeded random, so every run makes the same sounds. */
export const rng = (seed = 1) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

export const mtof = (m) => 440 * 2 ** ((m - 69) / 12);

/** Biquad filter (RBJ cookbook): "lp" | "hp" | "bp". Returns a per-sample function. */
export const biquad = (type, f, q = 0.707) => {
  const w = (2 * Math.PI * f) / SR;
  const c = Math.cos(w);
  const a = Math.sin(w) / (2 * q);
  let b0, b1, b2;
  if (type === "lp") [b0, b1, b2] = [(1 - c) / 2, 1 - c, (1 - c) / 2];
  else if (type === "hp") [b0, b1, b2] = [(1 + c) / 2, -(1 + c), (1 + c) / 2];
  else [b0, b1, b2] = [a, 0, -a];
  const a0 = 1 + a;
  const [B0, B1, B2, A1, A2] = [b0 / a0, b1 / a0, b2 / a0, (-2 * c) / a0, (1 - a) / a0];
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return (x) => {
    const y = B0 * x + B1 * x1 + B2 * x2 - A1 * y1 - A2 * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    return y;
  };
};

/** State-variable filter with a cutoff you can sweep per sample. */
export const svf = () => {
  let low = 0, band = 0;
  return (x, fc, q = 0.7) => {
    const f = 2 * Math.sin((Math.PI * Math.min(fc, SR / 6)) / SR);
    const high = x - low - band / q;
    band += f * high;
    low += f * band;
    return { low, band, high };
  };
};

/** A mono/stereo buffer you can drop sounds into at any time (wraps around when `loop` is set). */
export const track = (seconds, channels = 1, loop = false) => {
  const len = Math.round(seconds * SR);
  const ch = Array.from({ length: channels }, () => new Float32Array(len));
  const add = (atSec, sound, gain = 1, pan = 0) => {
    const start = Math.round(atSec * SR);
    const gl = channels === 2 ? Math.cos(((pan + 1) * Math.PI) / 4) * Math.SQRT2 : 1;
    const gr = channels === 2 ? Math.sin(((pan + 1) * Math.PI) / 4) * Math.SQRT2 : 1;
    for (let i = 0; i < sound.length; i++) {
      let j = start + i;
      if (j >= len) {
        if (!loop) break;
        j %= len;
      }
      if (j < 0) continue;
      ch[0][j] += sound[i] * gain * gl;
      if (channels === 2) ch[1][j] += sound[i] * gain * gr;
    }
  };
  return { len, ch, add };
};

/** Render a sound of `seconds` from a per-sample function f(t, i). */
export const render = (seconds, f) => {
  const out = new Float32Array(Math.round(seconds * SR));
  for (let i = 0; i < out.length; i++) out[i] = f(i / SR, i);
  return out;
};

export const normalize = (channels, peak = 0.89) => {
  let m = 1e-9;
  for (const c of channels) for (const v of c) m = Math.max(m, Math.abs(v));
  for (const c of channels) for (let i = 0; i < c.length; i++) c[i] *= peak / m;
  return channels;
};

/** Short fades so nothing clicks at the edges. */
export const edgeFade = (buf, inMs = 1, outMs = 8) => {
  const a = Math.round((inMs / 1000) * SR), b = Math.round((outMs / 1000) * SR);
  for (let i = 0; i < a && i < buf.length; i++) buf[i] *= i / a;
  for (let i = 0; i < b && i < buf.length; i++) buf[buf.length - 1 - i] *= i / b;
  return buf;
};

const wav = (channels) => {
  const n = channels[0].length, nc = channels.length;
  const b = Buffer.alloc(44 + n * nc * 2);
  b.write("RIFF", 0); b.writeUInt32LE(36 + n * nc * 2, 4); b.write("WAVE", 8);
  b.write("fmt ", 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(nc, 22);
  b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * nc * 2, 28); b.writeUInt16LE(nc * 2, 32); b.writeUInt16LE(16, 34);
  b.write("data", 36); b.writeUInt32LE(n * nc * 2, 40);
  for (let i = 0; i < n; i++)
    for (let c = 0; c < nc; c++)
      b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, channels[c][i])) * 32767), 44 + (i * nc + c) * 2);
  return b;
};

/**
 * Write channels to an MP3 via Remotion's bundled ffmpeg.
 * `lufs` runs loudness normalization (music); omit it for SFX (peak-normalized).
 */
export const writeMp3 = (outPath, channels, { lufs } = {}) => {
  const dir = join(tmpdir(), "mm-audio");
  mkdirSync(dir, { recursive: true });
  const tmp = join(dir, `${Date.now()}-${Math.round(Math.random() * 1e6)}.wav`);
  writeFileSync(tmp, wav(channels));
  mkdirSync(dirname(outPath), { recursive: true });
  const af = lufs ? ["-af", `loudnorm=I=${lufs}:TP=-1.5:LRA=11`] : [];
  execFileSync(ffmpeg(), ["-hide_banner", "-loglevel", "error", "-y", "-i", tmp, ...af, "-ar", String(SR), "-b:a", "192k", outPath], {
    stdio: "inherit",
  });
  rmSync(tmp);
};

/** Remotion's bundled ffmpeg (no separate install needed). */
const ffmpeg = () => {
  const require = createRequire(import.meta.url);
  const pkg = `@remotion/compositor-${process.platform}-${process.arch}${process.platform === "win32" ? "-msvc" : process.platform === "linux" ? "-gnu" : ""}`;
  return join(dirname(require.resolve(`${pkg}/package.json`)), process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg");
};
