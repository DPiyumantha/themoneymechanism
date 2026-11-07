import React from "react";
import { Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, useScale } from "../brand";

export type PhotoFrameProps = {
  /** staticFile("videos/<slug>/photo.jpg"). Only images you own or have rights to. */
  src: string;
  /** Short label under the photo. */
  caption?: string;
  /** Frame aspect ratio (width / height). Default 4/3. */
  aspect?: number;
  delay?: number;
};

/** A photo in a gold-edged card with a slow push-in. Products, stores, people. */
export const PhotoFrame: React.FC<PhotoFrameProps> = ({
  src,
  caption,
  aspect = 4 / 3,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const s = useScale();
  const p = spring({ frame: frame - delay, fps, config: theme.motion.spring });
  const zoom = interpolate(frame, [delay, durationInFrames], [1, 1.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 18 * s,
        width: "100%",
        opacity: p,
        transform: `scale(${0.94 + 0.06 * p})`,
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: `${aspect}`,
          borderRadius: 28 * s,
          overflow: "hidden",
          border: `${4 * s}px solid ${theme.colors.accent}`,
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
        }}
      >
        <Img
          src={src}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${zoom})`,
          }}
        />
      </div>
      {caption ? (
        <div
          style={{
            fontFamily: theme.fonts.body,
            fontWeight: 600,
            fontSize: 32 * s,
            color: theme.colors.inkMuted,
            textAlign: "center",
          }}
        >
          {caption}
        </div>
      ) : null}
    </div>
  );
};
