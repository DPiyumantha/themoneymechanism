/**
 * Veterans Day: why banks close but stores open (The Fine Print) — script and sources in ./script.md.
 * Scenes are timed to public/videos/veterans-day/voiceover.mp3 (Gemini TTS take, ~34 s; word
 * timings in ./captions.json). If the voice-over is replaced, re-time BEATS and the delays.
 */
import React from "react";
import { AbsoluteFill, getStaticFiles, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import type { Caption } from "@remotion/captions";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { sec, theme, useScale } from "../../brand";
import { BrandBackground, BrandedVideo, Captions, HookText, Kicker, SafeArea, SourceNote } from "../../components";
import captionsJson from "./captions.json";

const SLUG = "veterans-day";
const VOICEOVER = `videos/${SLUG}/voiceover.mp3`;
const hasVoiceover = getStaticFiles().some((f) => f.name === VOICEOVER);

const T = theme.motion.transitionFrames;
const c = theme.colors;

// Beat starts (s), each just before its first word: hook, closed ("It's a federal"),
// markets ("The bond"), stores ("Most stores"), tip ("One practical"), payoff ("Thank a"), end.
const BEATS = [0, 4.6, 12.0, 16.6, 22.0, 30.4, 35.4];
const len = (i: number) => sec(BEATS[i + 1]) - sec(BEATS[i]);

const SCENES = {
  hook: len(0) + T,
  closed: len(1) + T,
  markets: len(2) + T,
  stores: len(3) + T,
  tip: len(4) + T,
  payoff: len(5),
};
const TRANSITIONS = Object.keys(SCENES).length - 1;

/** Content length without the end card. Registered in src/videos/index.ts. */
export const CONTENT_FRAMES = Object.values(SCENES).reduce((a, b) => a + b, 0) - TRANSITIONS * T;

const captions: Caption[] = captionsJson;

const push = () => (
  <TransitionSeries.Transition
    presentation={slide({ direction: "from-right" })}
    timing={linearTiming({ durationInFrames: T })}
  />
);

/** One sound effect, starting `at` frames into its scene (public/sfx). */
const Sfx: React.FC<{ name: string; at: number; volume?: number }> = ({ name, at, volume = 0.4 }) => (
  <Sequence from={at} layout="none">
    <Audio src={staticFile(`sfx/${name}.mp3`)} volume={volume} />
  </Sequence>
);

/** Calm music bed: 0.12 under the voice, 15-frame fade in, 30-frame fade out before the end card. */
const musicVolume = (f: number) =>
  interpolate(f, [0, 15, CONTENT_FRAMES - 30, CONTENT_FRAMES], [0, 0.12, 0.12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** A flag-neutral gold awareness ribbon: a looped band with two tails. */
const RibbonIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M32 92 L50 56 L68 92 L58 86 L50 98 L42 86 Z" fill={c.accentDeep} />
    <path
      d="M50 56 C26 40 24 8 40 8 C48 8 50 20 50 28 C50 20 52 8 60 8 C76 8 74 40 50 56 Z"
      fill={c.accent}
      stroke={c.accentLight}
      strokeWidth={3}
      strokeLinejoin="round"
    />
  </svg>
);

/** A simple wall calendar: NOV, big 11, Wednesday, gold ribbon. */
const CalendarCard: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useScale();
  const p = spring({ frame: frame - delay, fps, config: theme.motion.spring });
  const r = spring({ frame: frame - delay - 14, fps, config: theme.motion.springSnappy });
  return (
    <div
      style={{
        position: "relative",
        width: 360 * s,
        borderRadius: 28 * s,
        overflow: "hidden",
        background: c.surface,
        border: `${3 * s}px solid ${c.line}`,
        opacity: p,
        transform: `translateY(${(1 - p) * 40 * s}px)`,
      }}
    >
      <div
        style={{
          background: c.accent,
          color: c.onAccent,
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 40 * s,
          letterSpacing: "0.12em",
          textAlign: "center",
          padding: `${14 * s}px 0`,
        }}
      >
        NOVEMBER
      </div>
      <div
        style={{
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 180 * s,
          lineHeight: 1.05,
          textAlign: "center",
          color: c.ink,
        }}
      >
        11
      </div>
      <div
        style={{
          fontFamily: theme.fonts.body,
          fontWeight: 600,
          fontSize: 36 * s,
          textAlign: "center",
          color: c.inkMuted,
          paddingBottom: 26 * s,
        }}
      >
        Wednesday
      </div>
      <div
        style={{
          position: "absolute",
          top: 62 * s,
          right: 18 * s,
          opacity: r,
          transform: `scale(${0.6 + 0.4 * r})`,
        }}
      >
        <RibbonIcon size={92 * s} />
      </div>
    </div>
  );
};

type Status = "closed" | "open";
type Row = { label: string; status: Status };

/** Open vs closed rows that appear on the frames in `at` (timed to the voice-over). */
const StatusList: React.FC<{ rows: Row[]; at: number[] }> = ({ rows, at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useScale();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 * s, width: "100%" }}>
      {rows.map((row, i) => {
        const p = spring({ frame: frame - at[i], fps, config: theme.motion.spring });
        const k = spring({ frame: frame - at[i] - 6, fps, config: theme.motion.springSnappy });
        const open = row.status === "open";
        return (
          <div
            key={row.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20 * s,
              background: c.surface,
              borderRadius: 24 * s,
              padding: `${24 * s}px ${32 * s}px`,
              border: `${2 * s}px solid ${open ? c.accent : c.line}`,
              opacity: p,
              transform: `translateX(${(1 - p) * -40 * s}px)`,
            }}
          >
            <div
              style={{
                fontFamily: theme.fonts.display,
                fontWeight: 700,
                fontSize: 46 * s,
                letterSpacing: "-0.02em",
                color: c.ink,
              }}
            >
              {row.label}
            </div>
            <div
              style={{
                fontFamily: theme.fonts.body,
                fontWeight: 700,
                fontSize: 32 * s,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: `${10 * s}px ${24 * s}px`,
                borderRadius: 999,
                background: open ? c.accent : "transparent",
                color: open ? c.onAccent : c.inkMuted,
                border: `${2 * s}px solid ${open ? c.accent : c.inkMuted}`,
                opacity: k,
                transform: `scale(${0.8 + 0.2 * k})`,
              }}
            >
              {open ? "Open" : "Closed"}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Transfer timeline: sent Wednesday, lands Thursday. */
const TransferTimeline: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useScale();
  const p = spring({ frame: frame - delay, fps, config: theme.motion.spring });
  const line = interpolate(frame, [delay + 14, delay + 44], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const land = spring({ frame: frame - delay - 46, fps, config: theme.motion.springSnappy });
  const node = (label: string, sub: string, hot: boolean, a: number) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 * s, opacity: a, width: 260 * s }}>
      <div
        style={{
          width: 120 * s,
          height: 120 * s,
          borderRadius: 999,
          background: hot ? c.accent : c.surface,
          border: `${3 * s}px solid ${hot ? c.accentLight : c.line}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 44 * s,
          color: hot ? c.onAccent : c.ink,
        }}
      >
        {label}
      </div>
      <div style={{ fontFamily: theme.fonts.body, fontWeight: 600, fontSize: 34 * s, color: hot ? c.accentLight : c.inkMuted, textAlign: "center" }}>
        {sub}
      </div>
    </div>
  );
  return (
    <div style={{ width: "100%", opacity: p }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        {node("Wed", "You send it", false, 1)}
        <div style={{ flex: 1, height: 120 * s, display: "flex", alignItems: "center" }}>
          <div style={{ position: "relative", width: "100%", height: 6 * s, background: c.line, borderRadius: 3 * s }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${line * 100}%`, background: c.accent, borderRadius: 3 * s }} />
          </div>
        </div>
        {node("Thu", "It may land", true, 0.35 + 0.65 * land)}
      </div>
    </div>
  );
};

export const VeteransDay: React.FC = () => (
  <BrandedVideo contentFrames={CONTENT_FRAMES}>
    <BrandBackground />
    <TransitionSeries>
      {/* 1. Hook. */}
      <TransitionSeries.Sequence durationInFrames={SCENES.hook}>
        <SafeArea>
          <Kicker text="The Fine Print" delay={2} />
          <HookText lines={["Your bank", "is closed.", "Stores aren't."]} highlight={["closed."]} delay={4} />
          <Sfx name="gear-ratchet" at={8} volume={0.35} />
        </SafeArea>
      </TransitionSeries.Sequence>
      {push()}

      {/* 2. Federal holiday: calendar, then what closes. */}
      <TransitionSeries.Sequence durationInFrames={SCENES.closed}>
        <SafeArea align="center">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 48, width: "100%" }}>
            <CalendarCard delay={4} />
            <StatusList
              rows={[
                { label: "Post offices", status: "closed" },
                { label: "The Federal Reserve", status: "closed" },
                { label: "Most banks", status: "closed" },
              ]}
              at={[sec(1.8), sec(4.0), sec(5.4)]}
            />
          </div>
          <Sfx name="mechanical-click" at={sec(1.8)} volume={0.35} />
          <SourceNote text="Source: Federal Reserve Banks, holiday schedule (K.8)" delay={sec(6.2)} />
        </SafeArea>
      </TransitionSeries.Sequence>
      {push()}

      {/* 3. Markets: bonds closed, stocks open. */}
      <TransitionSeries.Sequence durationInFrames={SCENES.markets}>
        <SafeArea align="center">
          <StatusList
            rows={[
              { label: "Bond market", status: "closed" },
              { label: "Stock market", status: "open" },
            ]}
            at={[sec(0.5), sec(2.2)]}
          />
          <Sfx name="mechanical-click" at={sec(2.3)} volume={0.35} />
          <SourceNote text="Sources: SIFMA recommendation, NYSE holiday calendar" delay={sec(3.1)} />
        </SafeArea>
      </TransitionSeries.Sequence>
      {push()}

      {/* 4. Stores open, military discounts. */}
      <TransitionSeries.Sequence durationInFrames={SCENES.stores}>
        <SafeArea align="center">
          <StatusList rows={[{ label: "Most stores", status: "open" }]} at={[sec(0.3)]} />
          <div style={{ height: 40 }} />
          <HookText
            lines={["Many offer discounts", "for veterans and", "service members."]}
            highlight={["veterans"]}
            size={60}
            delay={sec(1.8)}
          />
          <Sfx name="pop" at={sec(0.4)} volume={0.35} />
        </SafeArea>
      </TransitionSeries.Sequence>
      {push()}

      {/* 5. Practical tip: a transfer may land tomorrow. */}
      <TransitionSeries.Sequence durationInFrames={SCENES.tip}>
        <SafeArea align="center">
          <HookText lines={["Paying a bill", "today?"]} highlight={["today?"]} size={80} delay={4} />
          <div style={{ height: 60 }} />
          <TransferTimeline delay={sec(4.0)} />
          <Sfx name="mechanical-click" at={sec(4.0) + 46} volume={0.4} />
          <SourceNote text="Source: Federal Reserve Financial Services, holiday schedule" delay={sec(6.6)} />
        </SafeArea>
      </TransitionSeries.Sequence>
      {push()}

      {/* 6. Payoff. */}
      <TransitionSeries.Sequence durationInFrames={SCENES.payoff}>
        <SafeArea>
          <HookText
            lines={["Thank a veteran.", "Check your", "transfer date."]}
            highlight={["veteran."]}
            delay={4}
          />
        </SafeArea>
      </TransitionSeries.Sequence>
    </TransitionSeries>

    {hasVoiceover ? <Audio src={staticFile(VOICEOVER)} volume={0.85} /> : null}
    <Audio src={staticFile("music/track-1-gold-standard.mp3")} volume={musicVolume} />
    <AbsoluteFill>
      <Captions captions={captions} />
    </AbsoluteFill>
  </BrandedVideo>
);
