/**
 * Caught in the Machine · Ep 1 — "The Milk Run".
 * Jake comes home with six bags and no milk; Maya explains why milk is always at the back.
 * Story series tab, row Ep 1. Script and sources: ./script.md. Vertical Reels only.
 */
import React from "react";
import { AbsoluteFill, getStaticFiles, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { BrandedVideo, SourceNote } from "../../components";
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
import { Aisle, AISLE, Bags, bagLandFrames, ChipsBag, floorAt, Keys, Kitchen, MapLabel, Receipt, StoreMap } from "./props";

const SLUG = "story-milk-run";
const captions = captionsJson as SpeakerCaption[];
const files = getStaticFiles();
const bgOf = (n: number) => {
  const name = `videos/${SLUG}/bg-${n}.png`;
  return files.some((f) => f.name === name) ? staticFile(name) : undefined;
};
const BG_KITCHEN = bgOf(1);
const BG_AISLE = bgOf(2);

// Frames (30 fps), timed to voiceover.mp3 (44.5 s).
const TITLE_FRAMES = 60; // cold open over "I'm back!"
const BAGS_FROM = 62; // "That's… a lot of bags."
const RECEIPT_AT = 372; // "…never made it to the back of the store."
const MECH_FROM = 508; // Maya to camera: "Milk, eggs, bread."
const MECH_LEN = 352; // until she finishes "…didn't plan to buy." (28.3 s)
const AISLE_FROM = 866; // "The chips were on sale, though."
const EYE_LEVEL_AT = 998; // "They're at eye level."
const KITCHEN2_FROM = 1040; // "So what do I do? Walk faster?"
const LEAVE_AT = 1258; // Jake heads out mid "…I'm going back for the milk."
const TINY_FROM = 1332; // after "Take the list.": tiny Jake at the far end of the aisle
/** Content length without the end card. Registered in src/videos/index.ts. */
export const CONTENT_FRAMES = 1420;

/** Expression changes over time: [fromFrame, expression] pairs. */
const at = (frame: number, steps: [number, Expression][]) =>
  steps.reduce<Expression>((cur, [f, e]) => (frame >= f ? e : cur), steps[0][1]);

/** First frame of every dialogue line (speaker changes or a long pause), for the bubble pops. */
const LINE_STARTS = captions
  .filter((c, i) => i === 0 || c.speaker !== captions[i - 1].speaker || c.startMs - captions[i - 1].endMs > 900)
  .map((c) => Math.round((c.startMs / 1000) * 30));

const Kitchen1: React.FC = () => {
  const frame = useCurrentFrame();
  const tl = useSpeakerTimeline(captions);
  return (
    <StoryScene bg={BG_KITCHEN}>
      {BG_KITCHEN ? null : <Kitchen />}
      <Character
        name="maya"
        talking={tl.isTalking("maya")}
        bounceAt={tl.lineStartOf("maya")}
        expression={at(frame, [[0, "neutral"], [70, "surprised"], [245, "smug"], [300, "neutral"], [434, "smug"]])}
      />
      <Character
        name="jake"
        talking={tl.isTalking("jake")}
        bounceAt={tl.lineStartOf("jake")}
        expression={at(frame, [[0, "happy"], [150, "worried"], [282, "neutral"], [372, "worried"], [434, "surprised"]])}
        delay={2}
      />
      <Bags from={BAGS_FROM} />
      <Receipt at={RECEIPT_AT} />
    </StoryScene>
  );
};

const AisleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const tl = useSpeakerTimeline(captions);
  return (
    <StoryScene bg={BG_AISLE}>
      {BG_AISLE ? null : <Aisle eyeLevelAt={EYE_LEVEL_AT} />}
      <Character
        name="maya"
        talking={tl.isTalking("maya")}
        bounceAt={tl.lineStartOf("maya")}
        expression={at(frame, [[0, "neutral"], [928, "smug"]])}
        delay={AISLE_FROM - 30}
      />
      <Character
        name="jake"
        talking={tl.isTalking("jake")}
        bounceAt={tl.lineStartOf("jake")}
        expression={at(frame, [[0, "happy"], [EYE_LEVEL_AT + 6, "surprised"]])}
        delay={AISLE_FROM - 30}
      />
      <ChipsBag x={668} y={1010} />
    </StoryScene>
  );
};

const Kitchen2: React.FC = () => {
  const frame = useCurrentFrame();
  const tl = useSpeakerTimeline(captions);
  const jakeX = interpolate(frame, [LEAVE_AT, LEAVE_AT + 40], [780, 1320], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => t * t,
  });
  const leaving = frame >= LEAVE_AT - 6;
  return (
    <StoryScene bg={BG_KITCHEN}>
      {BG_KITCHEN ? null : <Kitchen />}
      <Character
        name="maya"
        talking={tl.isTalking("maya")}
        bounceAt={tl.lineStartOf("maya")}
        expression={at(frame, [[0, "neutral"], [1107, "smug"], [1300, "happy"]])}
        delay={KITCHEN2_FROM - 30}
      />
      <Character
        name="jake"
        talking={tl.isTalking("jake")}
        bounceAt={tl.lineStartOf("jake")}
        expression={at(frame, [[0, "worried"], [1107, "neutral"], [1220, "worried"]])}
        facing={leaving ? "right" : "left"}
        x={jakeX}
        delay={KITCHEN2_FROM - 30}
      />
      {frame >= 1236 ? <Keys x={leaving ? jakeX + 110 : jakeX - 110} y={1020} /> : null}
      <Bags from={BAGS_FROM} />
      <Receipt at={RECEIPT_AT} />
    </StoryScene>
  );
};

/** The button: a tiny Jake far down the aisle, still walking to the milk. */
const TinyJake: React.FC = () => {
  const frame = useCurrentFrame();
  const stage = useStage();
  const g = stage.groundY / stage.s;
  const d = interpolate(frame, [TINY_FROM, CONTENT_FRAMES], [0.66, 0.84], { extrapolateRight: "clamp" });
  const floorY = floorAt(g, d);
  const height = 700 * interpolate(d, [0, 1], [1, 0.17]);
  const bob = Math.abs(Math.sin(frame * 0.45)) * 5;
  return (
    <StoryScene bg={BG_AISLE} pushIn={false}>
      {BG_AISLE ? null : <Aisle />}
      <AbsoluteFill style={{ transform: `translateY(${(floorY - g - bob) * stage.s}px)` }}>
        <Character name="jake" expression="neutral" x={AISLE.vpx} height={height} facing="right" delay={TINY_FROM - 30} />
      </AbsoluteFill>
    </StoryScene>
  );
};

/** The whole story in one tree, switched on the absolute frame (captions drive every scene). */
const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < AISLE_FROM) return <Kitchen1 />;
  if (frame < KITCHEN2_FROM) return <AisleScene />;
  if (frame < TINY_FROM) return <Kitchen2 />;
  return <TinyJake />;
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

/** Label and source under the store map, in a left column clear of Gus (bottom right). */
const MechNotes: React.FC = () => {
  const { s } = useStage();
  return (
    <div style={{ alignSelf: "flex-start", width: "58%", display: "flex", flexDirection: "column", gap: 14 * s }}>
      <MapLabel delay={640}>
        Milk, eggs, bread
        <br />→ the back
      </MapLabel>
      <SourceNote text="Source: NPR Planet Money, 2014. Coolers also sit near the back loading dock." delay={700} />
    </div>
  );
};

const inMech = (f: number) => f >= MECH_FROM && f < MECH_FROM + MECH_LEN;

export const StoryMilkRun: React.FC = () => (
  <BrandedVideo contentFrames={CONTENT_FRAMES}>
    <Scene />
    <MechanismMoment from={MECH_FROM} durationInFrames={MECH_LEN} label="Store layout" scene={<Scene />} gusPose="shrug">
      <StoreMap delay={MECH_FROM + 12} coolerAt={MECH_FROM + 14} pathFrom={728} pathTo={830} />
      <MechNotes />
    </MechanismMoment>
    <EpisodeTitle ep={1} title="The Milk Run" hook="I only went in for milk." highlight={["milk."]} duration={TITLE_FRAMES} />

    <Audio src={staticFile(`videos/${SLUG}/voiceover.mp3`)} />
    <Audio src={staticFile("music/track-3-playful.mp3")} volume={musicVolume} />
    {LINE_STARTS.filter((f) => f >= TITLE_FRAMES && !inMech(f)).map((f) => (
      <Sfx key={f} name="pop" at={f} volume={0.25} />
    ))}
    {bagLandFrames(BAGS_FROM).map((f) => (
      <Sfx key={`bag-${f}`} name="mechanical-click" at={f} volume={0.3} />
    ))}
    <Sfx name="receipt-unroll" at={RECEIPT_AT} volume={0.45} />
    <Sfx name="whoosh" at={MECH_FROM} volume={0.4} />
    <Sfx name="whoosh" at={AISLE_FROM} volume={0.3} />
    <Sfx name="whoosh" at={KITCHEN2_FROM} volume={0.3} />
    <Sfx name="whoosh" at={TINY_FROM} volume={0.3} />

    <AbsoluteFill>
      <DialogueCaptions captions={captions} hideBefore={TITLE_FRAMES} plainDuring={[[MECH_FROM, MECH_FROM + MECH_LEN]]} />
    </AbsoluteFill>
  </BrandedVideo>
);
