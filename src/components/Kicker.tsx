import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, useScale } from "../brand";

/**
 * Small gold-outlined label above the hook. Use the series name:
 * "Follow the Money", "Priced In", "The Fine Print", "Rise & Fall".
 */
export const Kicker: React.FC<{ text: string; delay?: number }> = ({ text, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useScale();
  const p = spring({ frame: frame - delay, fps, config: theme.motion.springSnappy });
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        alignSelf: "flex-start",
        padding: `${12 * s}px ${24 * s}px`,
        borderRadius: 999,
        border: `${3 * s}px solid ${theme.colors.accent}`,
        color: theme.colors.accent,
        fontFamily: theme.fonts.body,
        fontWeight: 700,
        fontSize: theme.type.kicker * s,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        opacity: p,
        transform: `translateX(${(1 - p) * -30 * s}px)`,
      }}
    >
      {text}
    </div>
  );
};
