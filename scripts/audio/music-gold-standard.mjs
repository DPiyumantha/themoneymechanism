// Generates public/music/track-1-gold-standard.mp3: minimal hip-hop / lo-fi beat, 88 BPM,
// warm Rhodes chords, soft vinyl texture, deep subtle bass, crisp light drums,
// confident and premium, no vocals, seamless 22-bar loop (60 s). The default bed.
// Entirely synthesized here: no samples, no third-party audio.
// Run: node scripts/audio/music-gold-standard.mjs
import { biquad, mtof, normalize, render, rng, SR, track, writeMp3 } from "./dsp.mjs";

const BPM = 88;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;
const BARS = 22;
const STEP = BEAT / 4;
const SWING = 0.12 * STEP;

const song = track(BARS * BAR, 2, true);
const at = (bar, step) => bar * BAR + step * STEP + (step % 2 === 1 ? SWING : 0);

// ---------- instruments ----------

const kick = (() => {
  let ph = 0;
  const lp = biquad("lp", 3000);
  const n = rng(21);
  return render(0.5, (t) => {
    const f = 44 + 80 * Math.exp(-t / 0.03);
    ph += (2 * Math.PI * f) / SR;
    return Math.tanh(1.5 * (Math.sin(ph) * Math.exp(-t / 0.26) + lp(n() * 2 - 1) * Math.exp(-t / 0.002) * 0.3));
  });
})();

/** Crisp, light snare: noise burst + a little tone, then a soft room. */
const snare = (() => {
  const n = rng(22);
  const hp = biquad("hp", 1200);
  const bp = biquad("bp", 3800, 0.9);
  const hit = render(0.18, (t) => {
    const x = n() * 2 - 1;
    return (0.8 * bp(hp(x)) * Math.exp(-t / 0.05) + 0.35 * Math.sin(2 * Math.PI * 190 * t) * Math.exp(-t / 0.03));
  });
  const out = new Float32Array(Math.round(0.3 * SR));
  for (const [ms, g] of [[0, 1], [17, 0.25], [37, 0.14]]) {
    const s = Math.round((ms / 1000) * SR);
    for (let i = 0; i < hit.length && s + i < out.length; i++) out[s + i] += hit[i] * g;
  }
  return out;
})();

const hat = (() => {
  const n = rng(23);
  const hp = biquad("hp", 8000);
  return render(0.05, (t) => hp(n() * 2 - 1) * Math.exp(-t / 0.014));
})();

/** Warm electric-piano tone: sine body, soft 2nd harmonic, a short bell "tine" and slow tremolo. */
const rhodes = (midi, len) => {
  const f = mtof(midi);
  return render(len, (t) => {
    const env = Math.min(1, t / 0.006) * Math.exp(-t / 1.4) * Math.min(1, (len - t) / 0.08);
    const body = Math.sin(2 * Math.PI * f * t + 0.6 * Math.exp(-t / 0.25) * Math.sin(2 * Math.PI * f * t));
    const second = 0.25 * Math.sin(4 * Math.PI * f * t) * Math.exp(-t / 0.4);
    const tine = 0.08 * Math.sin(2 * Math.PI * f * 7.1 * t) * Math.exp(-t / 0.03);
    const trem = 1 + 0.12 * Math.sin(2 * Math.PI * 4.2 * t);
    return Math.tanh(1.2 * (body + second + tine)) * env * trem;
  });
};

/** Deep, round bass. */
const bass = (midi, len) => {
  const f = mtof(midi);
  const lp = biquad("lp", 400);
  return render(len, (t) => {
    const env = Math.min(1, t / 0.01) * Math.exp(-t / 0.9) * Math.min(1, (len - t) / 0.04);
    return lp(Math.tanh(1.5 * (Math.sin(2 * Math.PI * f * t) + 0.15 * Math.sin(4 * Math.PI * f * t)))) * env;
  });
};

// ---------- harmony ----------
// ii–V–I–vi in C, one bar each: Dm9 – G13 – Cmaj9 – Am9.
const prog = [
  { root: 38, notes: [53, 57, 60, 64] }, // Dm9 (F A C E)
  { root: 43, notes: [53, 57, 59, 64] }, // G13 (F A B E)
  { root: 36, notes: [52, 55, 59, 62] }, // Cmaj9 (E G B D)
  { root: 33, notes: [55, 59, 60, 64] }, // Am9 (G B C E)
];

// ---------- arrangement ----------
for (let bar = 0; bar < BARS; bar++) {
  const c = prog[bar % 4];
  const sparse = bar % 11 === 10; // a breath before each loop half

  // Drums: kick 1 and the "and" of 2 and 3; snare 2 and 4; swung 8th hats.
  song.add(at(bar, 0), kick, 0.9);
  if (!sparse) song.add(at(bar, 6), kick, 0.55);
  song.add(at(bar, 10), kick, 0.7);
  for (const s of [4, 12]) song.add(at(bar, s), snare, 0.42, 0.1);
  for (let s = 0; s < 16; s += 2) song.add(at(bar, s), hat, s % 4 === 0 ? 0.13 : 0.08, -0.3);

  // Rhodes: chord on 1 (rolled), and a softer re-hit on the "and" of 3.
  c.notes.forEach((m, i) => {
    song.add(at(bar, 0) + i * 0.012, rhodes(m, 1.6 * BEAT * 2), 0.11, i % 2 ? 0.25 : -0.25);
    if (!sparse) song.add(at(bar, 11) + i * 0.008, rhodes(m, 1.3 * BEAT), 0.06, i % 2 ? -0.2 : 0.2);
  });

  // Bass: root on 1, octave pickup at the end of the bar.
  song.add(at(bar, 0), bass(c.root, 2.6 * BEAT), 0.6);
  song.add(at(bar, 14), bass(c.root + 12, 0.4 * BEAT), 0.3);
}

// Vinyl texture: quiet filtered hiss plus sparse crackle, across the whole loop.
{
  const n = rng(31);
  const bpL = biquad("bp", 3000, 0.5), bpR = biquad("bp", 3200, 0.5);
  const [L, R] = song.ch;
  let pop = 0;
  for (let i = 0; i < L.length; i++) {
    if (n() < 0.00018) pop = (n() * 2 - 1) * 0.6;
    pop *= 0.82;
    L[i] += 0.012 * bpL(n() * 2 - 1) + 0.05 * pop;
    R[i] += 0.012 * bpR(n() * 2 - 1) + 0.05 * pop;
  }
}

// ---------- master ----------
const [L, R] = song.ch;
const lpL = biquad("lp", 9000), lpR = biquad("lp", 9000); // lo-fi warmth
for (let i = 0; i < L.length; i++) {
  L[i] = Math.tanh(1.1 * lpL(L[i]));
  R[i] = Math.tanh(1.1 * lpR(R[i]));
}
normalize([L, R], 0.9);
const out = "public/music/track-1-gold-standard.mp3";
writeMp3(out, [L, R], { lufs: -14 });
console.log(`  ${out}  ${(L.length / SR).toFixed(1)} s, ${BARS} bars at ${BPM} BPM, seamless loop`);
