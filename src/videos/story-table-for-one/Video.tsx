/**
 * Caught in the Machine · Ep 4 — "Table for One".
 * Jake sulks that nobody celebrates Singles' Day; Maya explains how a joke holiday became the world's
 * biggest shopping event. Story series tab, row Ep 4. Script and sources: ./script.md. Vertical Reels only.
 */
import React from "react";
import { AbsoluteFill, getStaticFiles, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { BrandedVideo, SourceNote, VersusCard } from "../../components";
import {
  Character,
  DialogueCaptions,
  EpisodeTitle,
  MechanismMoment,
  StoryScene,
  useSpeakerTimeline,
  useStage,
  type Expression,
  type SpeakerCaption,
} from "../../components/story";
import captionsJson from "./captions.json";
import { CalendarFlip, CoffeeSlide, Kitchen, OnesToBags } from "./props";

const SLUG = "story-table-for-one";
const captions = captionsJson as SpeakerCaption[];
const BG_NAME = `videos/${SLUG}/bg-1.png`;
const BG = getStaticFiles().some((f) => f.name === BG_NAME) ? staticFile(BG_NAME) : undefined;

// Frames (30 fps), timed to voiceover.mp3 (44.7 s).
const TITLE_FRAMES = 60; // cold open over "Nobody remembered my holiday."
const CAL_AT = 180; // "Singles' Day. Eleven eleven." calendar flips to 11/11
const CAL_UNTIL = 282;
const MECH_FROM = 495; // Maya to camera: "Then in 2009, Alibaba turned it into an online sale."
const MECH_LEN = 395; // until "…online sales combined." (29.7 s)
const FALL_AT = MECH_FROM + 22; // four 1s fall like dominoes and become bags
const BAR_AT = 632; // "By 2021" the bar for $84.5B
const SRC_AT = 700;
const VERSUS_AT = 754; // "far more than America's Black Friday and Cyber Monday online sales combined."
const COFFEE_AT = 1228; // "I'll buy you a coffee."
const CHECK_AT = 1262; // "On sale?" Jake checks the cup for a price tag
/** Content length without the end card. Registered in src/videos/index.ts. */
export const CONTENT_FRAMES = 1345;

/** Expression changes over time: [fromFrame, expression] pairs. */
const at = (frame: number, steps: [number, Expression][]) =>
  steps.reduce<Expression>((cur, [f, e]) => (frame >= f ? e : cur), steps[0][1]);

/** First frame of every dialogue line, for the bubble pops. */
const LINE_STARTS = captions
  .filter((c, i) => i === 0 || c.speaker !== captions[i - 1].speaker || c.startMs - captions[i - 1].endMs > 900)
  .map((c) => Math.round((c.startMs / 1000) * 30));

const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const tl = useSpeakerTimeline(captions);
  return (
    <StoryScene bg={BG}>
      {BG ? null : <Kitchen />}
      <Character
        name="maya"
        talking={tl.isTalking("maya")}
        bounceAt={tl.lineStartOf("maya")}
        expression={at(frame, [[0, "neutral"], [86, "smug"], [320, "neutral"], [420, "smug"], [1010, "neutral"], [1220, "smug"]])}
      />
      <Character
        name="jake"
        talking={tl.isTalking("jake")}
        bounceAt={tl.lineStartOf("jake")}
        expression={at(frame, [[0, "worried"], [140, "happy"], [330, "worried"], [900, "surprised"], [1000, "worried"], [1120, "neutral"], [1260, "surprised"], [1300, "happy"]])}
        delay={2}
      />
      <CalendarFlip at={CAL_AT} until={CAL_UNTIL} />
      <CoffeeSlide at={COFFEE_AT} checkAt={CHECK_AT} />
    </StoryScene>
  );
};

/** One sound effect at an absolute frame (public/sfx). */
const Sfx: React.FC<{ name: string; at: number; volume?: number }> = ({ name, at: from, volume = 0.4 }) => (
  <Sequence from={from} layout="none">
    <Audio src={staticFile(`sfx/${name}.mp3`)} volume={volume} />
  </Sequence>
);

/** Music bed at 0.10 under the dialogue, 15-frame fade in, 30-frame fade out before the end card. */
const musicVolume = (f: number) =>
  interpolate(f, [0, 15, CONTENT_FRAMES - 30, CONTENT_FRAMES], [0, 0.1, 0.1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Source line under the graphic, in a left column clear of Gus (bottom right). */
const MechSource: React.FC = () => {
  const { s } = useStage();
  return (
    <div style={{ width: "58%", marginTop: -12 * s }}>
      <SourceNote
        text="Source: Alibaba via Reuters, 11-day Singles' Day GMV 540.3B yuan (2021); Adobe Analytics, US Black Friday + Cyber Monday online $19.6B (2021)"
        delay={SRC_AT}
      />
    </div>
  );
};

const inMech = (f: number) => f >= MECH_FROM && f < MECH_FROM + MECH_LEN;

/** Shows its children from `from` to `until` (absolute frames) with a short fade. */
const Window: React.FC<{ from: number; until: number; children: React.ReactNode }> = ({ from, until, children }) => {
  const frame = useCurrentFrame();
  const { s } = useStage();
  if (frame < from || frame >= until) return null;
  const fade = interpolate(frame, [from, from + 6, until - 8, until], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ opacity: fade, display: "flex", flexDirection: "column", alignItems: "stretch", gap: 16 * s }}>{children}</div>
  );
};

export const StoryTableForOne: React.FC = () => (
  <BrandedVideo contentFrames={CONTENT_FRAMES}>
    <Scene />
    <MechanismMoment from={MECH_FROM} durationInFrames={MECH_LEN} label="Singles' Day" scene={<Scene />} gusPose="shrug">
      <Window from={MECH_FROM} until={VERSUS_AT}>
        <OnesToBags delay={MECH_FROM + 10} fallAt={FALL_AT} barAt={BAR_AT} />
        <MechSource />
      </Window>
      <Window from={VERSUS_AT - 2} until={MECH_FROM + MECH_LEN}>
        <VersusCard
          left={{ label: "US Black Friday + Cyber Monday", value: "$19.6B", note: "online, 2021" }}
          right={{ label: "Singles' Day", value: "$84.5B", note: "11 days, 2021" }}
          delay={VERSUS_AT}
        />
        <MechSource />
      </Window>
    </MechanismMoment>
    <EpisodeTitle ep={4} title="Table for One" hook="Nobody remembered my holiday." highlight={["holiday."]} duration={TITLE_FRAMES} />

    <Audio src={staticFile(`videos/${SLUG}/voiceover.mp3`)} />
    <Audio src={staticFile("music/track-3-playful.mp3")} volume={musicVolume} />
    {LINE_STARTS.filter((f) => f >= TITLE_FRAMES && !inMech(f) && Math.abs(f - CAL_AT) > 40).map((f) => (
      <Sfx key={f} name="pop" at={f} volume={0.25} />
    ))}
    <Sfx name="pop" at={CAL_AT + 18} volume={0.45} />
    <Sfx name="whoosh" at={MECH_FROM} volume={0.4} />
    {[0, 1, 2, 3].map((i) => (
      <Sfx key={i} name="coin-drop-soft" at={FALL_AT + i * 9 + 14} volume={0.4} />
    ))}

    <AbsoluteFill>
      <DialogueCaptions captions={captions} hideBefore={TITLE_FRAMES} plainDuring={[[MECH_FROM, MECH_FROM + MECH_LEN]]} />
    </AbsoluteFill>
  </BrandedVideo>
);
