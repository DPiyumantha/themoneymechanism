import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, useScale } from "../brand";

export type ListRevealProps = {
  /** 2–5 short points, under 7 words each. */
  items: string[];
  delay?: number;
  /** Frames between items. Time it to the voice-over. Default 20. */
  every?: number;
  /** Highlight the item currently being talked about. Default true. */
  focusCurrent?: boolean;
};

/** Numbered points revealed one at a time: "3 ways they get you to spend more". */
export const ListReveal: React.FC<ListRevealProps> = ({
  items,
  delay = 0,
  every = 20,
  focusCurrent = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useScale();
  const c = theme.colors;
  const current = Math.min(items.length - 1, Math.floor((frame - delay) / every));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 30 * s }}>
      {items.map((item, i) => {
        const p = spring({ frame: frame - delay - i * every, fps, config: theme.motion.spring });
        const dim = focusCurrent && i < current;
        return (
          <div
            key={item}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 28 * s,
              opacity: p * (dim ? 0.45 : 1),
              transform: `translateX(${(1 - p) * -40 * s}px)`,
            }}
          >
            <div
              style={{
                flexShrink: 0,
                width: 84 * s,
                height: 84 * s,
                borderRadius: 999,
                background: c.accent,
                color: c.onAccent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: theme.fonts.display,
                fontWeight: 800,
                fontSize: 44 * s,
              }}
            >
              {i + 1}
            </div>
            <div
              style={{
                fontFamily: theme.fonts.display,
                fontWeight: 700,
                fontSize: 52 * s,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                color: c.ink,
              }}
            >
              {item}
            </div>
          </div>
        );
      })}
    </div>
  );
};
