/**
 * STORY TEMPLATE — copy this folder to src/videos/<slug>/ for every "Caught in the Machine"
 * episode, then register it in src/videos/index.ts as "MM-Story<Name>" with format "reels".
 * Story episodes are always vertical Reels: 1080×1920 (9:16), 30 fps. Do not edit the template itself.
 * Series rules: .agents/skills/money-mechanism-video/references/story-series.md
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BrandedVideo, VersusCard } from "../../components";
import {
  Character,
  DialogueCaptions,
  EpisodeTitle,
  MechanismMoment,
  StoryScene,
  demoDialogue,
  useSpeakerTimeline,
  type Expression,
} from "../../components/story";

// Replace with captions.json transcribed from voiceover.mp3, every word tagged with its speaker:
// import captions from "./captions.json";
const captions = demoDialogue([
  ["Jake", "I only went in for milk.", 300, 1800],
  ["Maya", "That's a lot of bags. Did you get the milk?", 2100, 4300],
  ["Jake", "Okay. Funny story.", 4500, 5600],
  ["Maya", "You forgot the milk.", 5800, 7000],
  ["Jake", "I never made it to the back of the store.", 7200, 9400],
  ["Maya", "Milk, eggs, bread. They're why most people walk in. So stores put them all the way at the back.", 9800, 15000],
  ["Jake", "So what do I do? Walk faster?", 15400, 17200],
  ["Maya", "Make a list. Go straight to the back.", 17400, 19400],
  ["Jake", "I'm going back for the milk.", 19700, 21200],
]);

// Frames (30 fps). Time them to the voice-over.
const TITLE_FRAMES = 60; // cold open: EpisodeTitle shows the hook, bubbles start after
const MECH_FROM = 288; // Maya turns to the camera
const MECH_LEN = 168;
/** Content length without the end card. Registered in src/videos/index.ts. */
export const CONTENT_FRAMES = 660;

/** Expression changes over time: [fromFrame, expression] pairs. */
const at = (frame: number, steps: [number, Expression][]) =>
  steps.reduce<Expression>((cur, [f, e]) => (frame >= f ? e : cur), steps[0][1]);

const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const tl = useSpeakerTimeline(captions);
  return (
    <StoryScene /* bg={staticFile("videos/<slug>/bg-1.png")} */>
      <Character
        name="maya"
        talking={tl.isTalking("maya")}
        bounceAt={tl.lineStartOf("maya")}
        expression={at(frame, [[0, "neutral"], [170, "smug"], [520, "happy"]])}
        delay={0}
      />
      <Character
        name="jake"
        talking={tl.isTalking("jake")}
        bounceAt={tl.lineStartOf("jake")}
        expression={at(frame, [[0, "happy"], [130, "worried"], [460, "surprised"], [590, "worried"]])}
        delay={4}
      />
    </StoryScene>
  );
};

export const StoryTemplate: React.FC = () => (
  <BrandedVideo contentFrames={CONTENT_FRAMES}>
    <Scene />
    <MechanismMoment from={MECH_FROM} durationInFrames={MECH_LEN} label="Store layout" scene={<Scene />} gusPose="shrug">
      <VersusCard
        left={{ label: "You came for", value: "Milk" }}
        right={{ label: "You left with", value: "6 bags" }}
        delay={MECH_FROM + 14}
      />
    </MechanismMoment>
    <EpisodeTitle ep={1} title="The Milk Run" hook="I only went in for milk." highlight={["milk."]} duration={TITLE_FRAMES} />
    {/* <Audio src={staticFile("videos/<slug>/voiceover.mp3")} />  from "@remotion/media" */}
    {/* <Audio src={staticFile("music/track-3-playful.mp3")} volume={0.1} /> */}
    <AbsoluteFill>
      <DialogueCaptions captions={captions} hideBefore={TITLE_FRAMES} plainDuring={[[MECH_FROM, MECH_FROM + MECH_LEN]]} />
    </AbsoluteFill>
  </BrandedVideo>
);
