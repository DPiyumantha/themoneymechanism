/**
 * TEMPLATE — copy this folder to src/videos/<slug>/ for every new video,
 * then register it in src/videos/index.ts. Do not edit the template itself.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { theme } from "../../brand";
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
import { demoCaptions } from "../demoCaptions";

// Scene lengths in frames (30 fps). Time them to the voice-over.
const SCENES = {
  hook: 90,
  mechanism: 150,
  payoff: 75,
};
const T = theme.motion.transitionFrames;
const TRANSITIONS = Object.keys(SCENES).length - 1;

/** Content length without the end card. Registered in src/videos/index.ts. */
export const CONTENT_FRAMES =
  SCENES.hook + SCENES.mechanism + SCENES.payoff - TRANSITIONS * T;

// Replace with word timings transcribed from the voice-over, e.g.
// import captions from "./captions.json";
const captions = demoCaptions("Replace this with the real voice-over captions.", 300, 3000);

const push = () => (
  <TransitionSeries.Transition
    presentation={slide({ direction: "from-right" })}
    timing={linearTiming({ durationInFrames: T })}
  />
);

export const TemplateVideo: React.FC = () => (
  <BrandedVideo contentFrames={CONTENT_FRAMES}>
    <BrandBackground />
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={SCENES.hook}>
        <SafeArea>
          <Kicker text="Follow the Money" delay={4} />
          <HookText lines={["Your hook goes", "right here."]} highlight={["here"]} delay={10} />
        </SafeArea>
      </TransitionSeries.Sequence>
      {push()}
      <TransitionSeries.Sequence durationInFrames={SCENES.mechanism}>
        <SafeArea align="center">
          <StatCard value={42} suffix="%" label="The number that proves the point" delay={6} />
          <SourceNote text="Source: [publisher, year]" />
        </SafeArea>
      </TransitionSeries.Sequence>
      {push()}
      <TransitionSeries.Sequence durationInFrames={SCENES.payoff}>
        <SafeArea>
          <HookText lines={["The line that", "reframes it."]} highlight={["reframes"]} delay={4} />
        </SafeArea>
      </TransitionSeries.Sequence>
    </TransitionSeries>

    {/* <Audio src={staticFile("videos/<slug>/voiceover.mp3")} />  from "@remotion/media" */}
    {/* <Audio src={staticFile("music/<track>.mp3")} volume={0.12} /> */}
    <AbsoluteFill>
      <Captions captions={captions} />
    </AbsoluteFill>
  </BrandedVideo>
);
