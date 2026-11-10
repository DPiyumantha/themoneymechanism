/**
 * Caught in the Machine · Ep 3 — "Family Size".
 * Jake opens a "family size" bag that's mostly air; Maya explains shrinkflation and the unit price.
 * Story series tab, Row Ep 3. Script and sources: ./script.md. Vertical Reels only.
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
import { BagExpectation, BagOpening, DeflatingBag, JakesBag, LivingRoom, MayasBag, OunceTicker, ShelfTag } from "./props";

const SLUG = "story-family-size";
const captions = captionsJson as SpeakerCaption[];
const BG_NAME = `videos/${SLUG}/bg-1.png`;
const BG = getStaticFiles().some((f) => f.name === BG_NAME) ? staticFile(BG_NAME) : undefined;

// Frames (30 fps), timed to voiceover.mp3 (44.9 s) via the Gemini-aligned captions.json.
const TITLE_FRAMES = 60; // cold open over "Movie night! I got the family size."
const OPEN_AT = 138; // bag puffs open, one chip falls (before "It's a big family of one")
const SCRATCH_AT = 271; // "Why is it half air?"
const EXPECT_AT = 278; // Expectation vs Reality split
const EXPECT_UNTIL = 322;
const TICK_AT = 440; // "It used to be nine point seven five."
const TICK_UNTIL = 520;
const MECH_FROM = 598; // Maya to camera: "It's called shrinkflation."
const MECH_LEN = 614; // until "...the real price." (40.1 s)
const DEFLATE_AT = 771; // "or quietly shrink the package" (25.7 s)
const BAG_UNTIL = 856;
const VERSUS_AT = 861; // "because we watch prices, not ounces" (28.7 s)
const VERSUS_UNTIL = 1044;
const TAG_AT = 1050; // "The tiny number on the shelf tag." (35.0 s)
const CIRCLE_AT = 1129; // "Price per ounce." (37.6 s)
const MAYA_BAG_AT = 1258; // "Can I have some of yours?" (42.1 s)
const MAYA_DEFLATE_AT = 1295; // "Mine shrank too."
/** Content length without the end card. Registered in src/videos/index.ts. */
export const CONTENT_FRAMES = 1390;

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
      {BG ? null : <LivingRoom />}
      <Character
        name="maya"
        talking={tl.isTalking("maya")}
        bounceAt={tl.lineStartOf("maya")}
        expression={at(frame, [[0, "neutral"], [100, "smug"], [320, "neutral"], [521, "smug"], [1212, "neutral"], [1295, "neutral"]])}
      />
      <Character
        name="jake"
        talking={tl.isTalking("jake")}
        bounceAt={tl.lineStartOf("jake")}
        expression={at(frame, [[0, "happy"], [152, "worried"], [271, "surprised"], [375, "worried"], [571, "surprised"], [993, "worried"], [1218, "happy"], [1295, "worried"]])}
        delay={2}
      />
      <JakesBag />
      <MayasBag at={MAYA_BAG_AT} deflateAt={MAYA_DEFLATE_AT} />
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

const inMech = (f: number) => f >= MECH_FROM && f < MECH_FROM + MECH_LEN;

/** Shows its children from `from` to `until` (absolute frames) with a short fade. */
const Window: React.FC<{ from: number; until: number; children: React.ReactNode }> = ({ from, until, children }) => {
  const frame = useCurrentFrame();
  const { s } = useStage();
  if (frame < from || frame >= until) return null;
  const out = interpolate(frame, [until - 8, until], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ opacity: out, display: "flex", flexDirection: "column", alignItems: "stretch", gap: 16 * s }}>{children}</div>
  );
};

export const StoryFamilySize: React.FC = () => (
  <BrandedVideo contentFrames={CONTENT_FRAMES}>
    <Scene />
    <BagOpening at={OPEN_AT} duration={54} />
    <BagExpectation at={EXPECT_AT} until={EXPECT_UNTIL} />
    <OunceTicker at={TICK_AT} until={TICK_UNTIL} />
    <MechanismMoment from={MECH_FROM} durationInFrames={MECH_LEN} label="Shrinkflation" scene={<Scene />} gusPose="nervous">
      <DeflatingBag delay={MECH_FROM + 10} deflateAt={DEFLATE_AT} until={BAG_UNTIL} />
      <Window from={VERSUS_AT - 4} until={VERSUS_UNTIL}>
        <VersusCard
          left={{ label: "Before", value: "9.75 oz" }}
          right={{ label: "Now", value: "9.25 oz", note: "same price" }}
          delay={VERSUS_AT}
        />
        <div style={{ width: "70%" }}>
          <SourceNote text="Source: Frito-Lay, quoted by Newsweek, 2022 (one popular chip bag, unnamed here)" delay={VERSUS_AT + 24} />
        </div>
      </Window>
      <Window from={TAG_AT - 4} until={MECH_FROM + MECH_LEN}>
        <ShelfTag delay={TAG_AT} circleAt={CIRCLE_AT} />
      </Window>
    </MechanismMoment>
    <EpisodeTitle ep={3} title="Family Size" hook="It says family size. It's half air." highlight={["half", "air."]} duration={TITLE_FRAMES} />

    <Audio src={staticFile(`videos/${SLUG}/voiceover.mp3`)} />
    <Audio src={staticFile("music/track-3-playful.mp3")} volume={musicVolume} />
    {LINE_STARTS.filter((f) => f >= TITLE_FRAMES && !inMech(f) && Math.abs(f - OPEN_AT) > 20).map((f) => (
      <Sfx key={f} name="pop" at={f} volume={0.2} />
    ))}
    <Sfx name="pop" at={OPEN_AT + 2} volume={0.6} />
    <Sfx name="record-scratch" at={SCRATCH_AT} volume={0.45} />
    <Sfx name="mechanical-click" at={TICK_AT + 40} volume={0.4} />
    <Sfx name="whoosh" at={MECH_FROM} volume={0.4} />
    <Sfx name="price-tag-roll" at={CIRCLE_AT} volume={0.35} />
    <Sfx name="pop" at={MAYA_DEFLATE_AT} volume={0.4} />

    <AbsoluteFill>
      <DialogueCaptions captions={captions} hideBefore={TITLE_FRAMES} plainDuring={[[MECH_FROM, MECH_FROM + MECH_LEN]]} />
    </AbsoluteFill>
  </BrandedVideo>
);
