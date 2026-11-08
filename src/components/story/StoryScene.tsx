import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../brand";
import { BrandBackground } from "../BrandBackground";
import { useStage } from "./stage";

export type StorySceneProps = {
  /** Background image, e.g. staticFile("videos/<slug>/bg-1.png"). Omit to use the brand background. */
  bg?: string;
  /** Slow push-in on the background. Default true. */
  pushIn?: boolean;
  /** Characters (and props) standing on the stage. */
  children?: React.ReactNode;
};

/**
 * One story location: the background with a slow push-in, a warm floor light
 * where the characters stand, and darkened edges so captions stay readable.
 */
export const StoryScene: React.FC<StorySceneProps> = ({ bg, pushIn = true, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const stage = useStage();
  const zoom = pushIn ? interpolate(frame, [0, durationInFrames], [1, 1.07], { extrapolateRight: "clamp" }) : 1;

  return (
    <AbsoluteFill>
      {bg ? (
        <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
          <Img src={bg} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
      ) : (
        <BrandBackground />
      )}
      {/* readable top and bottom */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(11,11,13,0.55) 0%, rgba(11,11,13,0) 26%, rgba(11,11,13,0) 62%, rgba(11,11,13,0.75) 100%)`,
        }}
      />
      {/* warm floor light behind the characters */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: stage.headY - 80 * stage.s,
          height: stage.groundY - stage.headY + 160 * stage.s,
          background: `radial-gradient(60% 55% at 50% 70%, ${theme.colors.accent}38 0%, ${theme.colors.accent}10 45%, transparent 75%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: stage.groundY - 6 * stage.s,
          height: 3 * stage.s,
          background: `linear-gradient(90deg, transparent, ${theme.colors.line}, transparent)`,
        }}
      />
      {children}
    </AbsoluteFill>
  );
};
