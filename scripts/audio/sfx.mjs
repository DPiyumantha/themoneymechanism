// Generates the SFX pack in public/sfx/ (all original, synthesized from scratch).
// Run: node scripts/audio/sfx.mjs
import { createRequire } from "node:module";
import { biquad, edgeFade, normalize, render, rng, SR, svf, writeMp3 } from "./dsp.mjs";

const require = createRequire(import.meta.url);
const { spring } = require("remotion");
const OUT = "public/sfx";

// ---------- building blocks ----------

/** One small mechanical tick: metal ping + tiny body thunk. `bright` 0..1. */
const tick = (gain = 1, bright = 0.6, seed = 1) => {
  const r = rng(seed);
  const hp = biquad("hp", 2500);
  const p1 = 3400 + bright * 1800, p2 = p1 * 1.62;
  return render(0.05, (t) => {
    const n = hp(r() * 2 - 1) * Math.exp(-t / 0.0012);
    const ping = Math.sin(2 * Math.PI * p1 * t) * Math.exp(-t / 0.006) + 0.5 * Math.sin(2 * Math.PI * p2 * t) * Math.exp(-t / 0.004);
    const body = 0.5 * Math.sin(2 * Math.PI * 520 * t) * Math.exp(-t / 0.008);
    return gain * (0.8 * n + 0.45 * ping + body);
  });
};

/** The heavier "clack" when something locks into place. */
const clack = (gain = 1, seed = 7) => {
  const r = rng(seed);
  const hp = biquad("hp", 1800);
  const lp = biquad("lp", 7000);
  const hit = (t) => {
    if (t < 0) return 0;
    const n = hp(r() * 2 - 1) * Math.exp(-t / 0.002);
    const ping = Math.sin(2 * Math.PI * 2900 * t) * Math.exp(-t / 0.014) + 0.6 * Math.sin(2 * Math.PI * 4650 * t) * Math.exp(-t / 0.009);
    const f = 170 + 90 * Math.exp(-t / 0.01);
    const thunk = Math.sin(2 * Math.PI * f * t) * Math.exp(-t / 0.035);
    return n + 0.5 * ping + 0.9 * thunk;
  };
  // Main hit plus a smaller latch 16 ms later.
  return render(0.2, (t) => gain * lp(hit(t) + 0.35 * hit(t - 0.016)));
};

const mix = (seconds, parts) => {
  const out = new Float32Array(Math.round(seconds * SR));
  for (const [at, buf, g = 1] of parts) {
    const s = Math.round(at * SR);
    for (let i = 0; i < buf.length && s + i < out.length; i++) out[s + i] += buf[i] * g;
  }
  return out;
};

const save = (name, buf, peak = 0.7) => {
  edgeFade(buf);
  normalize([buf], peak);
  writeMp3(`${OUT}/${name}.mp3`, [buf]);
  console.log(`  ${OUT}/${name}.mp3  ${(buf.length / SR).toFixed(2)} s`);
};

// ---------- the pack ----------

// 1. Mechanical click.
save("mechanical-click", mix(0.22, [[0, clack(1)]]));

// 2. Gear ratchet: 14 even ticks, slightly uneven like real teeth.
{
  const r = rng(3);
  const parts = Array.from({ length: 14 }, (_, k) => [k * 0.042 + r() * 0.004, tick(0.6 + 0.4 * r(), 0.4, 10 + k)]);
  save("gear-ratchet", mix(0.68, parts));
}

// 3. Price-tag roll, synced to <PriceTag from="10.00" to="9.99">:
//    one tick each time a wheel passes a digit, then a clack when the last wheel lands.
{
  const cfg = { damping: 200, stiffness: 180, mass: 0.9 };
  const STAGGER = 3, SETTLE = 11, fps = 30;
  const wheels = [{ start: 0, steps: 9 }, { start: STAGGER, steps: 9 }, { start: 3 * STAGGER, steps: 9 }];
  const parts = [];
  wheels.forEach((w, wi) => {
    let passed = 0;
    for (let f = 0; f < 60 * 4; f++) {
      const frame = f / 4; // quarter-frame resolution
      const p = spring({ frame: frame - w.start, fps, config: cfg }) * w.steps;
      while (passed < w.steps - 1 && p >= passed + 1) {
        passed++;
        parts.push([frame / fps, tick(0.45 + 0.35 * (1 - passed / w.steps), 0.3 + 0.25 * wi, 100 + wi * 20 + passed)]);
      }
    }
  });
  const land = (4 * STAGGER + SETTLE) / fps;
  parts.push([land, clack(1.1, 9)]);
  save("price-tag-roll", mix(land + 0.25, parts));
}

// 4. Pop: a soft upward blip for speech bubbles and labels.
{
  const lp = biquad("lp", 5000);
  let ph = 0;
  save(
    "pop",
    render(0.14, (t) => {
      const f = 480 + 900 * (1 - Math.exp(-t / 0.018));
      ph += (2 * Math.PI * f) / SR;
      const env = Math.min(1, t / 0.002) * Math.exp(-t / 0.035);
      return lp(Math.sin(ph) * env + 0.15 * Math.sin(2 * ph) * env);
    }),
    0.6,
  );
}

// 5. Whoosh: band-passed air sweeping up and back down.
{
  const r = rng(5);
  const f = svf();
  const D = 0.6;
  save(
    "whoosh",
    render(D, (t) => {
      const x = t / D;
      const fc = 300 + 2600 * Math.sin(Math.PI * Math.min(1, x * 1.15)) ** 2;
      const env = Math.sin(Math.PI * x) ** 2;
      return f(r() * 2 - 1, fc, 1.4).band * env;
    }),
    0.55,
  );
}

// 6. Coin drop (soft): inharmonic metal partials, bouncing and settling.
{
  const partials = [[2093, 0.26], [3380, 0.18], [4871, 0.12], [6623, 0.08], [8040, 0.05]];
  const coin = (amp, len) =>
    render(len, (t) => amp * partials.reduce((s, [hz, d], k) => s + Math.sin(2 * Math.PI * hz * t + k) * Math.exp(-t / (d * len)) / (k + 1), 0) * Math.min(1, t / 0.0008));
  const hits = [[0, 1], [0.17, 0.55], [0.29, 0.38], [0.375, 0.25], [0.43, 0.17], [0.47, 0.11], [0.5, 0.07]];
  const lp = biquad("lp", 6500);
  const buf = mix(1.1, hits.map(([at, a]) => [at, coin(a, 0.6 * (0.4 + a)), 1]));
  for (let i = 0; i < buf.length; i++) buf[i] = lp(buf[i]);
  save("coin-drop-soft", buf, 0.55);
}

// 7. Cash-counter tick: fast paper flicks, like a bill counter.
{
  const r = rng(11);
  const flick = (g) => {
    const hp = biquad("hp", 3000), bp = biquad("bp", 5200, 1.2);
    return render(0.012, (t) => g * bp(hp(r() * 2 - 1)) * Math.exp(-t / 0.0025));
  };
  const parts = [];
  for (let t = 0; t < 0.85; t += 1 / 28) parts.push([t + r() * 0.003, flick(0.6 + 0.4 * r()) , Math.sin((Math.PI * t) / 0.85) ** 0.5]);
  save("cash-counter-tick", mix(0.9, parts), 0.6);
}

// 8. Receipt unroll: paper rustle with crackle as it feeds out.
{
  const r = rng(13);
  const bp = biquad("bp", 3600, 1.3);
  const lp = biquad("lp", 900);
  const D = 1.3;
  let crack = 0;
  save(
    "receipt-unroll",
    render(D, (t) => {
      if (r() < 0.004) crack = 1;
      crack *= 0.993;
      const env = Math.min(1, t / 0.06) * Math.min(1, (D - t) / 0.25);
      const n = r() * 2 - 1;
      return env * (bp(n) * (0.35 + 0.9 * crack) + 0.25 * lp(n));
    }),
    0.5,
  );
}

// 9. Record scratch: a short chord "played" back and forth at changing speed.
{
  const src = (pos) => {
    // A soft saw-ish chord as the "record".
    let s = 0;
    for (const hz of [220, 277.2, 329.6]) for (let h = 1; h <= 5; h++) s += Math.sin(2 * Math.PI * hz * h * pos) / h;
    return s / 6;
  };
  const D = 0.55;
  const bp = biquad("bp", 1400, 0.8);
  let pos = 0.3;
  save(
    "record-scratch",
    render(D, (t) => {
      const x = t / D;
      const speed = 2.4 * Math.sin(2 * Math.PI * 1.5 * x) * (1 - 0.4 * x); // forward, back, forward
      pos += speed / SR;
      const env = Math.min(1, Math.abs(speed) / 0.8) * Math.min(1, (D - t) / 0.05);
      return bp(src(pos)) * env;
    }),
    0.55,
  );
}

// 10. Pump click: a gas nozzle trigger latching: heavy metal clunk, then a short hollow knock.
{
  const r = rng(17);
  const hp = biquad("hp", 900);
  const lp = biquad("lp", 5000);
  const hit = (t, f0, g) => {
    if (t < 0) return 0;
    const n = hp(r() * 2 - 1) * Math.exp(-t / 0.003);
    const ring = Math.sin(2 * Math.PI * 1850 * t) * Math.exp(-t / 0.02) + 0.5 * Math.sin(2 * Math.PI * 3120 * t) * Math.exp(-t / 0.012);
    const f = f0 + 70 * Math.exp(-t / 0.012);
    const thunk = Math.sin(2 * Math.PI * f * t) * Math.exp(-t / 0.05);
    return g * (0.7 * n + 0.35 * ring + thunk);
  };
  save("pump-click", render(0.32, (t) => lp(hit(t, 120, 1) + hit(t - 0.045, 210, 0.45))), 0.7);
}
