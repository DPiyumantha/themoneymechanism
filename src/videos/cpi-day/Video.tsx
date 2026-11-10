/**
 * October inflation report, CPI day. (The Fine Print) Script and sources in ./script.md.
 * SHELL: all figures come from ./data.ts. Voice-over and captions are added after the
 * Nov 10, 2026 BLS release (see script.md, "After the release").
 */
import React from "react";
import { AbsoluteFill, getStaticFiles, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { sec, theme, useScale } from "../../brand";
import {
  BarChart,
  BrandBackground,
  BrandedVideo,
  Captions,
  HookText,
  Kicker,
  SafeArea,
  SourceNote,
  StatCard,
  VersusCard,
} from "../../components";
import { BEATS, CPI_PCT, FILLED, HUNDRED_PLUS, MONTH, MOVERS, SOURCE } from "./data";
import { captions } from "./captions";

const SLUG = "cpi-day";
const VOICEOVER = `videos/${SLUG}/voiceover.mp3`;
const hasVoiceover = getStaticFiles().some((f) => f.name === VOICEOVER);

const T = theme.motion.transitionFrames;
const len = (i: number) => sec(BEATS[i + 1]) - sec(BEATS[i]);

const SCENES = {
  hook: len(0) + T,
  stat: len(1) + T,
  versus: len(2) + T,
  chart: len(3) + T,
  meme: len(4) + T,
  fed: len(5) + T,
  payoff: len(6),
};
const TRANSITIONS = Object.keys(SCENES).length - 1;

/** Content length without the end card. Registered in src/videos/index.ts. */
export const CONTENT_FRAMES = Object.values(SCENES).reduce((a, b) => a + b, 0) - TRANSITIONS * T;

const push = () => (
  <TransitionSeries.Transition
    presentation={slide({ direction: "from-right" })}
    timing={linearTiming({ durationInFrames: T })}
  />
);

/** One sound effect, `at` frames into its scene (public/sfx). */
const Sfx: React.FC<{ name: string; at: number; volume?: number }> = ({ name, at, volume = 0.5 }) => (
  <Sequence from={at} layout="none">
    <Audio src={staticFile(`sfx/${name}.mp3`)} volume={volume} />
  </Sequence>
);

const musicVolume = (f: number) =>
  interpolate(f, [0, 15, CONTENT_FRAMES - 30, CONTENT_FRAMES], [0, 0.12, 0.12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const money = (n: number) => `$${n.toFixed(2)}`;

/** Red banner while the October numbers are still stand-ins. Disappears once FILLED is true. */
const DraftBanner: React.FC = () => {
  const s = useScale();
  if (FILLED) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 300 * s,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: theme.fonts.body,
        fontWeight: 700,
        fontSize: 26 * s,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: theme.colors.negative,
      }}
    >
      Draft: September stand-in numbers
    </div>
  );
};

/** A $100 bill that shrinks while a receipt prints beside it. Drawn in vector. */
const BillReceipt: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useScale();
  const c = theme.colors;
  const appear = spring({ frame: frame - delay, fps, config: theme.motion.spring });
  const range = [delay + 20, delay + 110];
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const shrink = interpolate(frame, range, [1, 0.72], clamp);
  const print = interpolate(frame, range, [0, 1], clamp);
  const rows = ["Eggs", "Gas", "Rent", "Coffee", "Groceries"];
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: 56 * s,
        opacity: appear,
        height: 330 * s,
      }}
    >
      <div style={{ width: 420 * s, height: 300 * s, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: 420 * s,
            height: 190 * s,
            transform: `scale(${shrink})`,
            borderRadius: 14 * s,
            background: c.surface,
            border: `${5 * s}px solid ${c.accent}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: theme.fonts.display,
            fontWeight: 800,
            fontSize: 96 * s,
            color: c.accentLight,
          }}
        >
          $100
        </div>
      </div>
      <div
        style={{
          width: 300 * s,
          height: 310 * s * print + 20 * s,
          overflow: "hidden",
          background: c.surface,
          borderRadius: `${6 * s}px ${6 * s}px 0 0`,
          padding: `${18 * s}px ${22 * s}px`,
          fontFamily: theme.fonts.body,
          fontWeight: 600,
          fontSize: 30 * s,
          color: c.inkMuted,
          display: "flex",
          flexDirection: "column",
          gap: 14 * s,
        }}
      >
        {rows.map((r) => (
          <div key={r} style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{r}</span>
            <span>$ ...</span>
          </div>
        ))}
        <div style={{ color: c.ink, borderTop: `${3 * s}px dashed ${c.line}`, paddingTop: 10 * s }}>TOTAL</div>
      </div>
    </div>
  );
};

/** Text-only split-screen meme. */
const Meme: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useScale();
  const c = theme.colors;
  const a = spring({ frame: frame - 2, fps, config: theme.motion.spring });
  const b = spring({ frame: frame - 40, fps, config: theme.motion.spring });
  const panel = (label: string, text: string, p: number, hot: boolean) => (
    <div
      style={{
        flex: 1,
        borderRadius: 28 * s,
        background: c.surface,
        border: `${4 * s}px solid ${hot ? c.accent : "rgba(255,255,255,0.08)"}`,
        padding: 40 * s,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 18 * s,
        opacity: p,
        transform: `translateY(${(1 - p) * 40 * s}px)`,
      }}
    >
      <div
        style={{
          fontFamily: theme.fonts.body,
          fontWeight: 700,
          fontSize: 28 * s,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: hot ? c.accent : c.inkMuted,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 72 * s,
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
          color: hot ? c.accentLight : c.ink,
        }}
      >
        {text}
      </div>
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 * s, height: 760 * s }}>
      {panel("Economists", "Inflation is cooling.", a, false)}
      {panel("My grocery receipt", "...", b, true)}
    </div>
  );
};

export const CpiDay: React.FC = () => (
  <BrandedVideo contentFrames={CONTENT_FRAMES}>
    <BrandBackground />
    <TransitionSeries>
      {/* 1. Hook. */}
      <TransitionSeries.Sequence durationInFrames={SCENES.hook}>
        <SafeArea>
          <Kicker text="The Fine Print" delay={2} />
          <HookText lines={["Prices rose again.", "Here's your $100."]} highlight={["$100."]} delay={4} size={88} />
        </SafeArea>
      </TransitionSeries.Sequence>
      {push()}

      {/* 2. The annual rate. */}
      <TransitionSeries.Sequence durationInFrames={SCENES.stat}>
        <SafeArea align="center">
          <StatCard value={CPI_PCT} suffix="%" decimals={1} trend="up" label={`Prices vs a year ago (${MONTH})`} delay={8} />
          <Sfx name="cash-counter-tick" at={8} volume={0.35} />
          <SourceNote text={SOURCE} delay={30} />
        </SafeArea>
      </TransitionSeries.Sequence>
      {push()}

      {/* 3. What $100 buys. */}
      <TransitionSeries.Sequence durationInFrames={SCENES.versus}>
        <SafeArea>
          <HookText lines={["Same stuff.", "Higher bill."]} highlight={["Higher"]} size={80} delay={4} />
          <VersusCard
            left={{ label: "A year ago", value: "$100.00" }}
            right={{ label: "Today", value: money(HUNDRED_PLUS) }}
            delay={40}
          />
          <Sfx name="mechanical-click" at={58} volume={0.45} />
          <BillReceipt delay={90} />
          <Sfx name="receipt-unroll" at={110} volume={0.4} />
          <SourceNote text={`$100 x (1 + ${CPI_PCT}%). ${SOURCE}`} delay={64} />
        </SafeArea>
      </TransitionSeries.Sequence>
      {push()}

      {/* 4. Biggest movers. */}
      <TransitionSeries.Sequence durationInFrames={SCENES.chart}>
        <SafeArea>
          <BarChart
            title="Biggest movers, vs a year ago"
            data={MOVERS.map((m) => ({ label: m.label, value: m.value, display: `${m.value.toFixed(1)}%` }))}
            highlight={0}
            height={380}
            delay={4}
          />
          <Sfx name="gear-ratchet" at={6} volume={0.4} />
          <SourceNote text={SOURCE} delay={20} />
        </SafeArea>
      </TransitionSeries.Sequence>
      {push()}

      {/* 5. Meme. */}
      <TransitionSeries.Sequence durationInFrames={SCENES.meme}>
        <SafeArea>
          <Meme />
          <Sfx name="record-scratch" at={38} volume={0.4} />
        </SafeArea>
      </TransitionSeries.Sequence>
      {push()}

      {/* 6. Fed. */}
      <TransitionSeries.Sequence durationInFrames={SCENES.fed}>
        <SafeArea>
          <HookText lines={["Higher odds of", "a Fed rate hike"]} highlight={["hike"]} size={84} delay={6} />
          <HookText lines={["in December."]} size={64} delay={40} />
          <SourceNote text="Market odds: [VERIFY] CME FedWatch, Nov 10, 2026" delay={60} />
        </SafeArea>
      </TransitionSeries.Sequence>
      {push()}

      {/* 7. Payoff. */}
      <TransitionSeries.Sequence durationInFrames={SCENES.payoff}>
        <SafeArea>
          <HookText lines={["Inflation isn't", "a number."]} delay={4} />
          <HookText lines={["It's your", "receipt."]} highlight={["receipt."]} delay={50} />
          <Sfx name="mechanical-click" at={62} volume={0.45} />
        </SafeArea>
      </TransitionSeries.Sequence>
    </TransitionSeries>

    <DraftBanner />
    {hasVoiceover ? <Audio src={staticFile(VOICEOVER)} volume={0.85} /> : null}
    <Audio src={staticFile("music/track-2-tension.mp3")} volume={musicVolume} />
    <AbsoluteFill>
      <Captions captions={captions} />
    </AbsoluteFill>
  </BrandedVideo>
);
