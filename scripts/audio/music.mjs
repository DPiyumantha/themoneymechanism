// Generates public/music/track-3-playful.mp3: bouncy minimal hip-hop, 100 BPM,
// plucked synth, finger snaps, light bass, no vocals, seamless 24-bar loop (57.6 s).
// Entirely synthesized here: no samples, no third-party audio.
// Run: node scripts/audio/music.mjs
import { biquad, mtof, normalize, render, rng, SR, track, writeMp3 } from "./dsp.mjs";

const BPM = 100;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;
const BARS = 24;
const STEP = BEAT / 4; // 16th note
const SWING = 0.18 * STEP; // late off-beat 16ths: the bounce

const song = track(BARS * BAR, 2, true);

const at = (bar, step) => bar * BAR + step * STEP + (step % 2 === 1 ? SWING : 0);

// ---------- instruments ----------

const kick = (() => {
  let ph = 0;
  const lp = biquad("lp", 4000);
  const n = rng(1);
  return render(0.45, (t) => {
    const f = 46 + 95 * Math.exp(-t / 0.035);
    ph += (2 * Math.PI * f) / SR;
    const body = Math.sin(ph) * Math.exp(-t / 0.22);
    const click = lp(n() * 2 - 1) * Math.exp(-t / 0.002) * 0.4;
    return Math.tanh(1.6 * (body + click));
  });
})();

const snap = (() => {
  const n = rng(2);
  const bp = biquad("bp", 2300, 1.6);
  const hp = biquad("hp", 900);
  const hit = render(0.06, (t) => bp(hp(n() * 2 - 1)) * (Math.exp(-t / 0.012) + 0.5 * Math.exp(-t / 0.004)));
  // A little room: three quiet reflections.
  const out = new Float32Array(Math.round(0.22 * SR));
  for (const [ms, g] of [[0, 1], [11, 0.32], [23, 0.2], [41, 0.1]]) {
    const s = Math.round((ms / 1000) * SR);
    for (let i = 0; i < hit.length && s + i < out.length; i++) out[s + i] += hit[i] * g;
  }
  return out;
})();

const hat = (open = false) => {
  const n = rng(open ? 4 : 3);
  const hp = biquad("hp", 7500);
  const d = open ? 0.07 : 0.018;
  return render(open ? 0.25 : 0.07, (t) => hp(n() * 2 - 1) * Math.exp(-t / d));
};
const hatC = hat(false);
const hatO = hat(true);

/** Karplus-Strong pluck: a short, warm plucked-synth note. */
const pluck = (midi, len = 0.9, bright = 0.5, seed = 1) => {
  const f = mtof(midi);
  const N = Math.max(2, Math.round(SR / f));
  const n = rng(seed);
  const buf = new Float32Array(N);
  let prev = 0;
  for (let i = 0; i < N; i++) {
    const x = n() * 2 - 1;
    buf[i] = prev = prev + bright * (x - prev); // pre-filtered noise: softer attack
  }
  const decay = 0.9965;
  const lp = biquad("lp", 3800);
  let i = 0;
  return render(len, (t) => {
    const j = i % N, k = (i + 1) % N;
    const y = buf[j];
    buf[j] = decay * 0.5 * (buf[j] + buf[k]);
    i++;
    const tail = Math.min(1, (len - t) / 0.05);
    return lp(y) * tail;
  });
};

/** Light round bass: sine + a touch of 2nd harmonic, soft attack. */
const bass = (midi, len) => {
  const f = mtof(midi);
  return render(len, (t) => {
    const env = Math.min(1, t / 0.008) * Math.exp(-t / 0.5) * Math.min(1, (len - t) / 0.03);
    const x = Math.sin(2 * Math.PI * f * t) + 0.22 * Math.sin(4 * Math.PI * f * t);
    return Math.tanh(1.3 * x) * env;
  });
};

// ---------- harmony ----------
// A: Fmaj9 – Em7 – Dm9 – G13   B: Bbmaj9 – Am7 – Gm9 – C9
const A = [
  { root: 41, notes: [57, 60, 64, 67] },
  { root: 40, notes: [55, 59, 62, 64] },
  { root: 38, notes: [53, 57, 60, 64] },
  { root: 43, notes: [53, 57, 59, 64] },
];
const B = [
  { root: 46, notes: [57, 60, 62, 65] },
  { root: 45, notes: [55, 60, 64, 67] },
  { root: 43, notes: [53, 58, 62, 65] },
  { root: 36, notes: [52, 58, 62, 67] },
];
// 24 bars: A A B A A B. Melody on the 2nd and 5th A.
const form = [
  ...A.map((c) => ({ ...c, mel: false })),
  ...A.map((c) => ({ ...c, mel: true })),
  ...B.map((c) => ({ ...c, mel: false })),
  ...A.map((c) => ({ ...c, mel: false })),
  ...A.map((c) => ({ ...c, mel: true })),
  ...B.map((c) => ({ ...c, mel: false })),
];

// Cheeky motif in F major pentatonic, two bars long: [step, midi, length in steps].
const motif = [
  [[0, 72, 2], [3, 74, 2], [6, 77, 3], [10, 74, 2], [12, 72, 3]],
  [[0, 69, 2], [2, 72, 2], [6, 67, 4], [11, 69, 2], [14, 72, 2]],
];

// ---------- arrangement ----------
form.forEach((chord, bar) => {
  // Drums: kick 1, the "a" of 2, the "and" of 3; snaps on 2 and 4; swung 8th hats.
  for (const s of [0, 7, 10]) song.add(at(bar, s), kick, s === 0 ? 0.95 : 0.75);
  if (bar % 4 === 3) song.add(at(bar, 15), kick, 0.5); // pickup into the next phrase
  for (const s of [4, 12]) song.add(at(bar, s), snap, 0.55, -0.15);
  for (let s = 0; s < 16; s += 2) song.add(at(bar, s), hatC, s % 4 === 0 ? 0.16 : 0.1, 0.35);
  song.add(at(bar, 15), hatC, 0.06, 0.35); // ghost 16th
  if (bar % 2 === 1) song.add(at(bar, 14), hatO, 0.07, 0.35);

  // Bass: root, root, fifth, then a step toward the next bar.
  const root = chord.root;
  const next = form[(bar + 1) % form.length].root;
  const approach = next > root ? next - 1 : next + 1;
  song.add(at(bar, 0), bass(root, 3 * STEP), 0.5);
  song.add(at(bar, 7), bass(root, 2 * STEP), 0.42);
  song.add(at(bar, 10), bass(root + 7, 2 * STEP), 0.38);
  song.add(at(bar, 14), bass(approach, 1.6 * STEP), 0.32);

  // Plucked chord stabs on the off-beats, notes spread across the stereo field.
  for (const s of [3, 11]) {
    chord.notes.forEach((m, i) => {
      song.add(at(bar, s) + i * 0.006, pluck(m, 0.7, 0.45, bar * 100 + s * 10 + i), 0.13, i % 2 ? 0.3 : -0.3);
    });
  }

  // Melody, kept quiet under the voice.
  if (chord.mel) {
    const phrase = motif[bar % 2];
    for (const [s, m, len] of phrase) song.add(at(bar, s), pluck(m, len * STEP + 0.25, 0.6, bar * 7 + s), 0.16, -0.2);
  }
});

// ---------- master ----------
const [L, R] = song.ch;
const lpL = biquad("lp", 11000), lpR = biquad("lp", 11000);
for (let i = 0; i < L.length; i++) {
  L[i] = Math.tanh(1.1 * lpL(L[i]));
  R[i] = Math.tanh(1.1 * lpR(R[i]));
}
normalize([L, R], 0.9);
const out = "public/music/track-3-playful.mp3";
writeMp3(out, [L, R], { lufs: -14 });
console.log(`  ${out}  ${(L.length / SR).toFixed(1)} s, ${BARS} bars at ${BPM} BPM, seamless loop`);
