/**
 * Caught in the Machine · Ep 2 — "Jake's Coffee Bank".
 * Jake loads $50 onto the coffee app; Maya points out he just made an interest-free deposit.
 * Story series tab, row Ep 2. Script and sources: ./script.md. Vertical Reels only.
 */
import React from "react";
import { AbsoluteFill, getStaticFiles, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { BrandedVideo, Mascot, SourceNote, StatCard } from "../../components";
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
import { CoffeeShop, CupVault, JakeGrid, OldGiftCard, PovFlash, ReloadScreen } from "./props";

const SLUG = "story-coffee-bank";
const captions = captionsJson as SpeakerCaption[];
const BG_NAME = `videos/${SLUG}/bg-1.png`;
const BG = getStaticFiles().some((f) => f.name === BG_NAME) ? staticFile(BG_NAME) : undefined;

// Frames (30 fps), timed to voiceover.mp3 (43.7 s).
const TITLE_FRAMES = 60; // cold open over "Watch this. Fifty bucks on the coffee app."
const RELOAD_AT = 40; // "$50.00 added" on Jake's phone
const RELOAD_UNTIL = 142;
const POV_AT = 468; // after "Yeah, but I'll drink it."
const GRID_AT = 515; // "Now multiply you by millions of people."
const MECH_FROM = 606; // Maya to camera: "Starbucks is holding about…"
const MECH_LEN = 340; // until "…use the money." (31.2 s)
const BILL_AT = MECH_FROM + 16; // $50 floats into the cup vault
const STAT_AT = 650; // "one point seven five billion"
const LOCK_AT = 866; // "Starbucks doesn't."
const CARD_AT = 1140; // "a gift card from 2019"
const GUS_AT = 1200; // Gus salutes the card
/** Content length without the end card. Registered in src/videos/index.ts. */
export const CONTENT_FRAMES = 1350;

/** Expression changes over time: [fromFrame, expression] pairs. */
const at = (frame: number, steps: [number, Expression][]) =>
  steps.reduce<Expression>((cur, [f, e]) => (frame >= f ? e : cur), steps[0][1]);

/** First frame of every dialogue line, for the bubble pops. */
const LINE_STARTS = captions
  .filter((c, i) => i === 0 || c.speaker !== captions[i - 1].speaker || c.startMs - captions[i - 1].endMs > 900)
  .map((c) => Math.round((c.startMs / 1000) * 30));

/** Gus on the counter, saluting the 2019 gift card. */
const SalutingGus: React.FC = () => {
  const frame = useCurrentFrame();
  const stage = useStage();
  if (frame < GUS_AT) return null;
  const size = 280;
  return (
    <div
      style={{
        position: "absolute",
        left: stage.xOf(540) - (size / 2) * stage.s,
        top: stage.groundY - 340 * stage.s - size * 1.1 * stage.s,
      }}
    >
      <Mascot pose="salute" delay={GUS_AT} poseAt={GUS_AT + 10} size={size} />
    </div>
  );
};

const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const tl = useSpeakerTimeline(captions);
  return (
    <StoryScene bg={BG}>
      {BG ? null : <CoffeeShop />}
      <Character
        name="maya"
        talking={tl.isTalking("maya")}
        bounceAt={tl.lineStartOf("maya")}
        expression={at(frame, [[0, "neutral"], [148, "smug"], [287, "neutral"], [482, "smug"], [1010, "neutral"], [1256, "smug"]])}
      />
      <Character
        name="jake"
        talking={tl.isTalking("jake")}
        bounceAt={tl.lineStartOf("jake")}
        expression={at(frame, [[0, "smug"], [244, "surprised"], [427, "happy"], [515, "worried"], [952, "neutral"], [1129, "worried"], [1256, "happy"]])}
        delay={2}
      />
      <ReloadScreen at={RELOAD_AT} until={RELOAD_UNTIL} />
      <OldGiftCard at={CARD_AT} x={700} y={1010} />
      <SalutingGus />
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

/** Source line under the stat, in a left column clear of Gus (bottom right). */
const MechSource: React.FC = () => {
  const { s } = useStage();
  return (
    <div style={{ width: "58%", marginTop: -12 * s }}>
      <SourceNote text="Source: Starbucks FY2025 10-K, stored value cards and loyalty program, Sep 28, 2025" delay={STAT_AT + 40} />
    </div>
  );
};

const inMech = (f: number) => f >= MECH_FROM && f < MECH_FROM + MECH_LEN;

export const StoryCoffeeBank: React.FC = () => (
  <BrandedVideo contentFrames={CONTENT_FRAMES}>
    <Scene />
    <JakeGrid at={GRID_AT} until={MECH_FROM + 4} />
    <PovFlash at={POV_AT} />
    <MechanismMoment from={MECH_FROM} durationInFrames={MECH_LEN} label="Stored value" scene={<Scene />} gusPose="neutral">
      <CupVault delay={MECH_FROM + 10} billAt={BILL_AT} lockAt={LOCK_AT} />
      <StatCard value={1.75} prefix="$" suffix="B" decimals={2} label="in unspent balances and rewards" delay={STAT_AT} />
      <MechSource />
    </MechanismMoment>
    <EpisodeTitle ep={2} title="Jake's Coffee Bank" hook="Fifty bucks on the coffee app. Genius." highlight={["Genius."]} duration={TITLE_FRAMES} />

    <Audio src={staticFile(`videos/${SLUG}/voiceover.mp3`)} />
    <Audio src={staticFile("music/track-1-gold-standard.mp3")} volume={musicVolume} />
    {LINE_STARTS.filter((f) => f >= TITLE_FRAMES && !inMech(f)).map((f) => (
      <Sfx key={f} name="pop" at={f} volume={0.25} />
    ))}
    <Sfx name="mechanical-click" at={RELOAD_AT + 16} volume={0.45} />
    <Sfx name="whoosh" at={MECH_FROM} volume={0.4} />
    <Sfx name="coin-drop-soft" at={BILL_AT + 24} volume={0.45} />
    <Sfx name="mechanical-click" at={LOCK_AT + 12} volume={0.45} />

    <AbsoluteFill>
      <DialogueCaptions captions={captions} hideBefore={TITLE_FRAMES} plainDuring={[[MECH_FROM, MECH_FROM + MECH_LEN]]} />
    </AbsoluteFill>
  </BrandedVideo>
);
