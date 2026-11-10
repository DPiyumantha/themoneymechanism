/**
 * Beef up, eggs way down (The Fine Print) — script and sources in ./script.md.
 * Scenes are timed to public/videos/beef-eggs/voiceover.mp3 (Gemini TTS take, 42.2 s; word
 * timings in ./captions.json). If the voice-over is replaced, re-time BEATS and the delays.
 */
import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import type { Caption } from "@remotion/captions";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { sec, theme } from "../../brand";
import {
  BrandBackground,
  BrandedVideo,
  Captions,
  HookText,
  Kicker,
  SafeArea,
  SourceNote,
  StatCard,
} from "../../components";
import captionsJson from "./captions.json";
import { DivergingBars, Seesaw, SplitMeme } from "./graphics";

const T = theme.motion.transitionFrames;

// Beat starts (s), each just before its first word in the voice-over:
// hook ("Burgers"), forecast ("The USDA's"), why beef ("Why?"), flocks ("Egg-laying"),
// overall ("Overall"), payoff ("Every price"), end. Voice-over runs 42.2 s.
const BEATS = [0, 4.6, 20.0, 29.2, 34.1, 38.9, 43.1];
const len = (i: number) => sec(BEATS[i + 1]) - sec(BEATS[i]);

// Scene lengths in frames; every scene but the last gets +T for the overlapping push.
const SCENES = {
  hook: len(0) + T,
  forecast: len(1) + T,
  beef: len(2) + T,
  eggs: len(3) + T,
  overall: len(4) + T,
  payoff: len(5),
};
const TRANSITIONS = Object.keys(SCENES).length - 1;

/** Content length without the end card. Registered in src/videos/index.ts. */
export const CONTENT_FRAMES =
  Object.values(SCENES).reduce((a, b) => a + b, 0) - TRANSITIONS * T;

const captions: Caption[] = captionsJson;

const push = () => (
  <TransitionSeries.Transition
    presentation={slide({ direction: "from-right" })}
    timing={linearTiming({ durationInFrames: T })}
  />
);

/** One sound effect, starting `at` frames into its scene (public/sfx). */
const Sfx: React.FC<{ name: string; at: number; volume?: number }> = ({ name, at, volume = 0.5 }) => (
  <Sequence from={at} layout="none">
    <Audio src={staticFile(`sfx/${name}.mp3`)} volume={volume} />
  </Sequence>
);

/** Music bed: 0.12 under the voice, 15-frame fade in, 30-frame fade out before the end card. */
const musicVolume = (f: number) =>
  interpolate(f, [0, 15, CONTENT_FRAMES - 30, CONTENT_FRAMES], [0, 0.12, 0.12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const FORECAST = [
  { label: "Beef & veal", value: 8.7, display: "+8.7%" },
  { label: "Sugar & sweets", value: 6.5, display: "+6.5%" },
  { label: "Fresh vegetables", value: 5.8, display: "+5.8%" },
  { label: "Eggs", value: -29.3, display: "−29.3%" },
];
// Bar entrances (frames into the scene): beef on "beef prices", the rest on "biggest jumps", eggs on "going the other way".
const BAR_AT = [66, 205, 222, 350];

const Forecast: React.FC = () => {
  const frame = useCurrentFrame();
  return <DivergingBars data={FORECAST} highlight={frame < BAR_AT[3] ? 0 : 3} at={BAR_AT} />;
};

export const BeefEggs: React.FC = () => (
  <BrandedVideo contentFrames={CONTENT_FRAMES}>
    <BrandBackground />
    <TransitionSeries>
      {/* 1. Hook. */}
      <TransitionSeries.Sequence durationInFrames={SCENES.hook}>
        <SafeArea>
          <Kicker text="The Fine Print" delay={2} />
          <HookText lines={["Burgers up.", "Eggs down 29%."]} highlight={["29%."]} delay={8} />
        </SafeArea>
      </TransitionSeries.Sequence>
      {push()}

      {/* 2. USDA 2026 forecasts. */}
      <TransitionSeries.Sequence durationInFrames={SCENES.forecast}>
        <SafeArea>
          <HookText lines={["2026 price forecasts"]} size={64} delay={6} />
          <Forecast />
          <Sfx name="mechanical-click" at={72} volume={0.4} />
          <Sfx name="mechanical-click" at={352} volume={0.5} />
          <SourceNote text="Source: USDA ERS Food Price Outlook, Oct 23, 2026" delay={90} />
        </SafeArea>
      </TransitionSeries.Sequence>
      {push()}

      {/* 3. Why beef is up: small herd, slow rebuild. Seesaw: steak up, eggs down. */}
      <TransitionSeries.Sequence durationInFrames={SCENES.beef}>
        <SafeArea>
          <Sequence durationInFrames={44} layout="none">
            <HookText lines={["Why?"]} highlight={["Why?"]} delay={6} />
          </Sequence>
          <Sequence from={44} durationInFrames={168} layout="none">
            <HookText lines={["Small herd.", "Slow to rebuild."]} highlight={["rebuild."]} size={80} delay={2} />
          </Sequence>
          <Sequence from={212} layout="none">
            <HookText lines={["You can't", "rush a cow."]} highlight={["cow."]} size={80} delay={2} />
          </Sequence>
          <Seesaw delay={30} tiltAt={150} />
          <Sfx name="gear-ratchet" at={150} volume={0.4} />
          <SourceNote text="Source: USDA cattle inventory, Jan 2026: smallest herd since 1951" delay={60} />
        </SafeArea>
      </TransitionSeries.Sequence>
      {push()}

      {/* 4. Why eggs fell: flocks recovered. Meme split screen. */}
      <TransitionSeries.Sequence durationInFrames={SCENES.eggs}>
        <SafeArea>
          <HookText lines={["Flocks bounced back."]} highlight={["bounced"]} size={72} delay={6} />
          <SplitMeme delay={40} secondAt={110} />
          <Sfx name="pop" at={110} volume={0.45} />
          <SourceNote text="Source: USDA ERS, Oct 23, 2026 (recovery from avian flu losses)" delay={120} />
        </SafeArea>
      </TransitionSeries.Sequence>
      {push()}

      {/* 5. Overall food at home. */}
      <TransitionSeries.Sequence durationInFrames={SCENES.overall}>
        <SafeArea align="center">
          <StatCard value={2.3} prefix="+" suffix="%" decimals={1} label="Groceries overall, 2026 forecast" delay={10} />
          <Sfx name="mechanical-click" at={40} volume={0.4} />
          <SourceNote text="Food at home. Source: USDA ERS, Oct 23, 2026" delay={20} />
        </SafeArea>
      </TransitionSeries.Sequence>
      {push()}

      {/* 6. Payoff. */}
      <TransitionSeries.Sequence durationInFrames={SCENES.payoff}>
        <SafeArea>
          <HookText lines={["Every price has", "a supply chain", "behind it."]} highlight={["supply", "chain"]} delay={10} />
        </SafeArea>
      </TransitionSeries.Sequence>
    </TransitionSeries>

    <Audio src={staticFile("videos/beef-eggs/voiceover.mp3")} volume={0.85} />
    <Audio src={staticFile("music/track-1-gold-standard.mp3")} volume={musicVolume} loop />
    <AbsoluteFill>
      <Captions captions={captions} />
    </AbsoluteFill>
  </BrandedVideo>
);
