import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../brand";

/**
 * Standard backdrop: dark graphite gradient with slow-drifting light bands.
 * Put it first in every scene that doesn't use full-screen footage.
 */
export const BrandBackground: React.FC<{ textured?: boolean }> = ({
  textured = true,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const drift = (frame * 0.4) % width;
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${theme.colors.bgAlt} 0%, ${theme.colors.bg} 70%)`,
      }}
    >
      {textured ? (
        <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
          <polygon
            points={`${0.45 * width + drift},0 ${0.75 * width + drift},0 ${0.3 * width + drift},${height} ${drift},${height}`}
            fill="#FFFFFF"
            fillOpacity={0.025}
          />
          <polygon
            points={`${0.85 * width + drift},0 ${0.93 * width + drift},0 ${0.48 * width + drift},${height} ${0.4 * width + drift},${height}`}
            fill="#FFFFFF"
            fillOpacity={0.02}
          />
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};
