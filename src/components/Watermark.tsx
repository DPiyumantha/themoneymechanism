import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Logo, theme, useSafeZone, useScale } from "../brand";

/** Small logo + page name pinned top-left inside the safe zone. Added by BrandedVideo. */
export const Watermark: React.FC = () => {
  const frame = useCurrentFrame();
  const safe = useSafeZone();
  const s = useScale();
  const opacity = interpolate(frame, [0, 10], [0, 0.92], {
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: safe.top,
        left: safe.left,
        display: "flex",
        alignItems: "center",
        gap: 14 * s,
        opacity,
      }}
    >
      <Logo size={60 * s} badge />
      <div
        style={{
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 26 * s,
          letterSpacing: "-0.01em",
          color: theme.colors.ink,
          textShadow: "0 2px 10px rgba(0,0,0,0.55)",
        }}
      >
        {theme.pageName}
      </div>
    </div>
  );
};
