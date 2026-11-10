/**
 * Caught in the Machine · Ep 5 — "The $6 Problem".
 * Jake adds a $12 avocado slicer to dodge $6 shipping; Maya shows the free-shipping threshold at work.
 * Story series tab, row Ep 5. Script and sources: ./script.md. Vertical Reels only.
 */
import React from "react";
import { AbsoluteFill, getStaticFiles, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { BrandedVideo, Mascot, SourceNote, VersusCard } from "../../components";
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
import { Calculator, CartPanel, EndProps, LivingRoom, ThresholdBar } from "./props";

const SLUG = "story-six-dollar-problem";
const captions = captionsJson as SpeakerCaption[];
const BG_NAME = `videos/${SLUG}/bg-1.png`;
const BG = getStaticFiles().some((f) => f.name === BG_NAME) ? staticFile(BG_NAME) : undefined;

// Frames (30 fps), timed to voiceover.mp3 (46.1 s).
const TITLE_FRAMES = 60; // cold open over "Twenty-nine dollars. Shipping's six."
const CART_AT = 14; // Jake pulls up the cart: $29.00
const RAMP_FROM = 448; // "A twelve-dollar avocado slicer." cart ticks $29 -> $41
const RAMP_TO = 494;
const STAMP_AT = 735; // "Free shipping!" the -$6 stamp, crossed out, then +$12
const CART_UNTIL = 815;
const MECH_FROM = 828; // Maya to camera: "He just spent twelve dollars to save six."
const MECH_LEN = 222; // until "...top up your cart." (34.7 s)
const SCRATCH_AT = 836; // record-scratch on "He just spent twelve dollars to save six"
const CLIMB_AT = MECH_FROM + 30; // threshold bar climbs past the gold $35 line
const VERSUS_AT = MECH_FROM + 70; // "Paid $12" vs "Saved $6"
const GUS_MATH_AT = 1062; // meme beat: Gus on a calculator, over Jake's "Okay, when you say it like that…"
const GUS_MATH_UNTIL = 1150;
const SLICER_AT = 1260; // "Or… I start eating avocados." Jake holds up the slicer
const AVOCADO_AT = 1318; // "Free shipping is a price, too." Maya hands him an avocado
/** Content length without the end card. Registered in src/videos/index.ts. */
export const CONTENT_FRAMES = 1410;

/** Expression changes over time: [fromFrame, expression] pairs. */
const at = (frame: number, steps: [number, Expression][]) =>
  steps.reduce<Expression>((cur, [f, e]) => (frame >= f ? e : cur), steps[0][1]);

/** First frame of every dialogue line, for the bubble pops. */
const LINE_STARTS = captions
  .filter((c, i) => i === 0 || c.speaker !== captions[i - 1].speaker || c.startMs - captions[i - 1].endMs > 900)
  .map((c) => Math.round((c.startMs / 1000) * 30));

/** Meme beat: Gus doing the math on a calculator, bottom centre between the two. */
const GusMath: React.FC = () => {
  const frame = useCurrentFrame();
  const stage = useStage();
  if (frame < GUS_MATH_AT || frame >= GUS_MATH_UNTIL) return null;
  const size = 260;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: stage.xOf(540) - (size / 2) * stage.s,
          top: stage.groundY - 330 * stage.s - size * 1.1 * stage.s,
        }}
      >
        <Mascot pose="sweat" delay={GUS_MATH_AT} poseAt={GUS_MATH_AT + 6} size={size} />
      </div>
      <Calculator x={540} y={stage.groundY / stage.s - 190} at={GUS_MATH_AT + 6} until={GUS_MATH_UNTIL} />
    </>
  );
};

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
        expression={at(frame, [[0, "neutral"], [175, "smug"], [565, "neutral"], [830, "smug"], [1130, "neutral"], [1317, "smug"]])}
      />
      <Character
        name="jake"
        talking={tl.isTalking("jake")}
        bounceAt={tl.lineStartOf("jake")}
        expression={at(frame, [[0, "smug"], [300, "happy"], [440, "happy"], [565, "worried"], [640, "happy"], [1060, "worried"], [1257, "happy"], [1340, "surprised"]])}
        delay={2}
      />
      <CartPanel at={CART_AT} rampFrom={RAMP_FROM} rampTo={RAMP_TO} stampAt={STAMP_AT} until={CART_UNTIL} />
      <EndProps slicerAt={SLICER_AT} avocadoAt={AVOCADO_AT} />
      <GusMath />
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

/** Source line under the versus card, in a left column clear of Gus (bottom right). */
const MechSource: React.FC = () => {
  const { s } = useStage();
  return (
    <div style={{ width: "58%", marginTop: -8 * s }}>
      <SourceNote text="Math: $29 cart + $12 slicer = $41; $6 shipping avoided. Thresholds vary by store." delay={VERSUS_AT + 30} />
    </div>
  );
};

const inMech = (f: number) => f >= MECH_FROM && f < MECH_FROM + MECH_LEN;

export const StorySixDollarProblem: React.FC = () => (
  <BrandedVideo contentFrames={CONTENT_FRAMES}>
    <Scene />
    <MechanismMoment from={MECH_FROM} durationInFrames={MECH_LEN} label="Free-shipping threshold" scene={<Scene />} gusPose="nervous">
      <ThresholdBar delay={MECH_FROM + 10} climbAt={CLIMB_AT} />
      <VersusCard left={{ label: "Paid", value: "$12" }} right={{ label: "Saved", value: "$6" }} emphasis="left" delay={VERSUS_AT} />
      <MechSource />
    </MechanismMoment>
    <EpisodeTitle
      ep={5}
      title="The $6 Problem"
      hook="Free shipping at $35. I'm a genius."
      highlight={["genius."]}
      duration={TITLE_FRAMES}
    />

    <Audio src={staticFile(`videos/${SLUG}/voiceover.mp3`)} />
    <Audio src={staticFile("music/track-3-playful.mp3")} volume={musicVolume} />
    {LINE_STARTS.filter((f) => f >= TITLE_FRAMES && !inMech(f)).map((f) => (
      <Sfx key={f} name="pop" at={f} volume={0.25} />
    ))}
    {[0, 10, 20, 30, 40].map((d) => (
      <Sfx key={d} name="cash-counter-tick" at={RAMP_FROM + d} volume={0.35} />
    ))}
    <Sfx name="pop" at={Math.round((RAMP_FROM + RAMP_TO) / 2)} volume={0.5} />
    <Sfx name="mechanical-click" at={STAMP_AT + 6} volume={0.45} />
    <Sfx name="pop" at={STAMP_AT + 30} volume={0.4} />
    <Sfx name="whoosh" at={MECH_FROM} volume={0.4} />
    <Sfx name="record-scratch" at={SCRATCH_AT} volume={0.4} />
    <Sfx name="pop" at={GUS_MATH_AT + 6} volume={0.3} />

    <AbsoluteFill>
      <DialogueCaptions captions={captions} hideBefore={TITLE_FRAMES} plainDuring={[[MECH_FROM, MECH_FROM + MECH_LEN]]} />
    </AbsoluteFill>
  </BrandedVideo>
);
