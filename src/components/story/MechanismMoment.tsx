import React from "react";
import { AbsoluteFill, Freeze, interpolate, useCurrentFrame } from "remotion";
import { theme, useSafeZone, useScale } from "../../brand";
import { Kicker } from "../Kicker";
import { Mascot, type MascotPose } from "../Mascot";
import { SafeArea } from "../SafeArea";

export type MechanismMomentProps = {
  /** First frame of the moment (when Maya turns to the camera). */
  from: number;
  durationInFrames: number;
  /** Short name of the mechanism, e.g. "Store layout". Shown as "THE MECHANISM: STORE LAYOUT". */
  label: string;
  /** The scene to freeze behind the overlay (the same element the episode renders). */
  scene: React.ReactNode;
  /** Gus's reaction pose. Omit to leave Gus out. */
  gusPose?: MascotPose;
  /** The explainer graphic: StatCard, VersusCard, CoinBuckets, BarChart… (delays relative to `from`). */
  children?: React.ReactNode;
};

const IN = 8;
const OUT = 8;

/**
 * The series' signature beat: the scene freezes and drains to grey, a gold
 * X-ray grid sweeps over it, the mechanism is named and explained with one
 * graphic, Gus reacts, and the scene comes back to life.
 * Place it after the scene in the tree; it renders only during its frames.
 */
export const MechanismMoment: React.FC<MechanismMomentProps> = ({
  from,
  durationInFrames,
  label,
  scene,
  gusPose,
  children,
}) => {
  const frame = useCurrentFrame();
  const s = useScale();
  const safe = useSafeZone();
  if (frame < from || frame >= from + durationInFrames) return null;
  const local = frame - from;
  const end = durationInFrames;

  const on = interpolate(local, [0, IN, end - OUT, end], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sweep = interpolate(local, [0, 16], [0, 1], { extrapolateRight: "clamp" });
  const scanY = interpolate(local, [0, 22], [-5, 105], { extrapolateRight: "clamp" });
  const grid = 54 * s;

  return (
    <AbsoluteFill>
      {/* frozen scene, drained and pushed in */}
      <AbsoluteFill
        style={{
          filter: `grayscale(${0.85 * on}) brightness(${1 - 0.55 * on})`,
          transform: `scale(${1 + 0.04 * on})`,
        }}
      >
        <Freeze frame={from}>{scene}</Freeze>
      </AbsoluteFill>
      {/* gold X-ray grid */}
      <AbsoluteFill
        style={{
          opacity: on,
          backgroundImage: `linear-gradient(${theme.colors.accent}2E 2px, transparent 2px), linear-gradient(90deg, ${theme.colors.accent}2E 2px, transparent 2px)`,
          backgroundSize: `${grid}px ${grid}px`,
          clipPath: `inset(0 ${100 - sweep * 100}% 0 0)`,
        }}
      />
      {scanY < 100 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${scanY}%`,
            height: 6 * s,
            background: theme.colors.accentLight,
            boxShadow: `0 0 ${40 * s}px ${theme.colors.accent}`,
            opacity: on,
          }}
        />
      ) : null}
      <AbsoluteFill style={{ opacity: on }}>
        <SafeArea>
          <Kicker text={`The mechanism: ${label}`} delay={from + 4} />
          {children}
        </SafeArea>
        {gusPose ? (
          // Clear of the like/comment/share column on the right edge of mobile Reels.
          <div style={{ position: "absolute", right: safe.right + 120 * s, bottom: safe.bottom + 190 * s }}>
            <Mascot pose={gusPose} delay={from + 10} poseAt={from + 20} size={250} />
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
