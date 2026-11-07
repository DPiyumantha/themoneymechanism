import React from "react";
import { AbsoluteFill, Series, useVideoConfig } from "remotion";
import { endCardFrames, theme } from "../brand";
import { EndCard } from "./EndCard";
import { Watermark } from "./Watermark";

export type BrandedVideoProps = {
  /** Length of YOUR content in frames, without the end card. */
  contentFrames: number;
  /** Corner logo + page name during the content. Default on. */
  watermark?: boolean;
  children: React.ReactNode;
};

/**
 * The root of every video. Adds the corner watermark and appends the
 * 3.5 s end card with the logo and page name. The composition's
 * durationInFrames must be brandedDuration(contentFrames).
 */
export const BrandedVideo: React.FC<BrandedVideoProps> = ({
  contentFrames,
  watermark = true,
  children,
}) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.bg }}>
      <Series>
        <Series.Sequence durationInFrames={contentFrames} name="Content">
          <AbsoluteFill>{children}</AbsoluteFill>
          {watermark ? <Watermark /> : null}
        </Series.Sequence>
        <Series.Sequence durationInFrames={endCardFrames(fps)} name="End card">
          <EndCard />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
