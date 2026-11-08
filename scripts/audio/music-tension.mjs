// Generates public/music/track-2-tension.mp3: dark ambient electronic, 96 BPM,
// pulsing synth bass, ticking clock-like hi-hats, subtle risers, serious but not scary,
// no vocals, seamless 24-bar loop (60 s). For news (gas, CPI, Fed) and Rise & Fall stories.
// Entirely synthesized here: no samples, no third-party audio.
// Run: node scripts/audio/music-tension.mjs
import { biquad, mtof, normalize, render, rng, SR, svf, track, writeMp3 } from "./dsp.mjs";

const BPM = 96;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;
const BARS = 24;
const STEP = BEAT / 4;

const song = track(BARS * BAR, 2, true);
const at = (bar, step) => bar * BAR + step * STEP;

// ---------- instruments ----------

/** Soft, low kick: a felt thump, not a club kick. */
const kick = (() => {
  let ph = 0;
  return render(0.5, (t) => {
    const f = 42 + 60 * Math.exp(-t / 0.04);
    ph += (2 * Math.PI * f) / SR;
    return Math.tanh(1.4 * Math.sin(ph) * Math.exp(-t / 0.3));
  });
})();

/** Clock tick: a short, dry, metallic click. */
const tick = (bright) => {
  const n = rng(bright ? 11 : 12);
  const hp = biquad("hp", bright ? 6500 : 4800);
  const p = bright ? 5200 : 3900;
  return render(0.04, (t) => (0.7 * hp(n() * 2 - 1) + 0.4 * Math.sin(2 * Math.PI * p * t)) * Math.exp(-t / 0.005));
};
const tickHi = tick(true);
const tickLo = tick(false);

/** Muted rim on 2 and 4: a hollow knock. */
const rim = (() => {
  const n = rng(5);
  const bp = biquad("bp", 1700, 3);
  return render(0.12, (t) => (bp(n() * 2 - 1) * 2 + 0.6 * Math.sin(2 * Math.PI * 820 * t)) * Math.exp(-t / 0.018));
})();

/** Pulsing synth bass: detuned saws through a resonant low-pass that opens and closes. */
const pulse = (midi, len, open = 0.5) => {
  const f = mtof(midi);
  const flt = svf();
  let p1 = 0, p2 = 0;
  return render(len, (t) => {
    p1 = (p1 + f / SR) % 1;
    p2 = (p2 + (f * 1.006) / SR) % 1;
    const saw = (p1 * 2 - 1) + (p2 * 2 - 1);
    const env = Math.min(1, t / 0.004) * Math.exp(-t / 0.16) * Math.min(1, (len - t) / 0.01);
    const fc = 140 + 900 * open * Math.exp(-t / 0.07);
    const y = flt(saw * 0.5, fc, 1.6).low;
    const sub = Math.sin(2 * Math.PI * (f / 2) * t) * 0.6;
    return Math.tanh(1.4 * (y + sub)) * env;
  });
};

/** Dark pad: slow-attack detuned saws, heavily filtered. One chord = 4 bars. */
const pad = (notes, len, seed) => {
  const r = rng(seed);
  const voices = notes.flatMap((m) => [mtof(m) * 0.997, mtof(m) * 1.003].map((f) => ({ f, p: r() })));
  const lp1 = biquad("lp", 900), lp2 = biquad("lp", 700);
  return render(len, (t) => {
    let s = 0;
    for (const v of voices) {
      v.p = (v.p + v.f / SR) % 1;
      s += v.p * 2 - 1;
    }
    const env = Math.min(1, t / 1.6) * Math.min(1, (len - t) / 1.2);
    const wobble = 1 + 0.15 * Math.sin(2 * Math.PI * 0.12 * t);
    return lp2(lp1(s / voices.length)) * env * wobble;
  });
};

/** Subtle riser: filtered noise and a rising sine over 2 bars, cut off on the downbeat. */
const riser = (() => {
  const len = 2 * BAR;
  const n = rng(9);
  const flt = svf();
  let ph = 0;
  return render(len, (t) => {
    const x = t / len;
    const fc = 400 + 5000 * x * x;
    const noise = flt(n() * 2 - 1, fc, 2).band;
    ph += (2 * Math.PI * (300 + 900 * x * x)) / SR;
    const env = x ** 2.2 * Math.min(1, (len - t) / 0.02);
    return (0.8 * noise + 0.15 * Math.sin(ph)) * env;
  });
})();

// ---------- harmony ----------
// D minor: Dm – Bb – Gm – A (4 bars each), twice, then Dm – Bb.
const prog = [
  { root: 38, pad: [50, 53, 57, 62] }, // Dm
  { root: 34, pad: [50, 53, 58, 62] }, // Bb
  { root: 31, pad: [50, 55, 58, 62] }, // Gm
  { root: 33, pad: [49, 52, 57, 61] }, // A
];
const chordAt = (bar) => prog[Math.floor(bar / 4) % prog.length];

// ---------- arrangement ----------
for (let bar = 0; bar < BARS; bar++) {
  const c = chordAt(bar);
  // Pads, one per 4-bar block.
  if (bar % 4 === 0) {
    const p = pad(c.pad, 4 * BAR + 1.2, bar + 1);
    song.add(at(bar, 0), p, 0.22, -0.25);
    song.add(at(bar, 0) + 0.011, p, 0.22, 0.25);
  }
  // Kick on 1 and the "and" of 3; rim on 2 and 4 (from bar 2 so the loop breathes).
  song.add(at(bar, 0), kick, 0.8);
  song.add(at(bar, 10), kick, 0.55);
  if (bar % 8 !== 0) for (const s of [4, 12]) song.add(at(bar, s), rim, 0.22, -0.1);
  // Clock ticks: 8ths, accent on the beat, plus 16th ghosts in the second half of each phrase.
  for (let s = 0; s < 16; s += 2) song.add(at(bar, s), s % 4 === 0 ? tickHi : tickLo, s % 4 === 0 ? 0.13 : 0.08, 0.4);
  if (bar % 4 >= 2) for (let s = 1; s < 16; s += 2) song.add(at(bar, s), tickLo, 0.04, 0.4);
  // Bass pulse: 8th notes on the root, the filter opening toward the end of the bar.
  for (let s = 0; s < 16; s += 2) {
    const m = s === 14 && bar % 4 === 3 ? c.root + 7 : c.root;
    song.add(at(bar, s), pulse(m, 1.7 * STEP, 0.25 + 0.05 * s), 0.34);
  }
  // Riser into every 8th bar.
  if (bar % 8 === 6) song.add(at(bar, 0), riser, 0.2, 0);
}

// ---------- master ----------
const [L, R] = song.ch;
const lpL = biquad("lp", 10000), lpR = biquad("lp", 10000);
for (let i = 0; i < L.length; i++) {
  L[i] = Math.tanh(1.1 * lpL(L[i]));
  R[i] = Math.tanh(1.1 * lpR(R[i]));
}
normalize([L, R], 0.9);
const out = "public/music/track-2-tension.mp3";
writeMp3(out, [L, R], { lufs: -14 });
console.log(`  ${out}  ${(L.length / SR).toFixed(1)} s, ${BARS} bars at ${BPM} BPM, seamless loop`);
