import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { theme, useScale } from "../brand";

/** Small source line under a figure: "Source: Costco 10-K, 2025". */
export const SourceNote: React.FC<{ text: string; delay?: number }> = ({ text, delay = 10 }) => {
  const frame = useCurrentFrame();
  const s = useScale();
  return (
    <div
      style={{
        fontFamily: theme.fonts.body,
        fontWeight: 500,
        fontSize: theme.type.source * s,
        color: theme.colors.inkMuted,
        opacity: interpolate(frame, [delay, delay + 12], [0, 0.85], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      {text}
    </div>
  );
};
