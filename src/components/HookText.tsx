import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, useScale } from "../brand";

export type HookTextProps = {
  /** One string per line. 2–3 lines, under ~8 words in total. */
  lines: string[];
  /** Words to highlight in gold (case-insensitive, punctuation ignored). Usually one. */
  highlight?: string[];
  /** Frame to start the word-by-word reveal. */
  delay?: number;
  /** Max font size in design px. Default theme.type.hook (96). Long lines shrink to fit. */
  size?: number;
  align?: "left" | "center";
};

const clean = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}$%]/gu, "");

/** Big headline that lands word by word. The opening hook and the closing line. */
export const HookText: React.FC<HookTextProps> = ({
  lines,
  highlight = [],
  delay = 0,
  size = theme.type.hook,
  align = "left",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useScale();
  const marks = new Set(highlight.map(clean));
  // Auto-fit: shrink so the longest line fits the frame width on one line.
  const longest = Math.max(...lines.map((l) => l.length), 1);
  const fitted = Math.min(size, Math.floor(1550 / longest));
  let index = 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 * s }}>
      {lines.map((ln, li) => (
        <div
          key={li}
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: align === "center" ? "center" : "flex-start",
            gap: `${8 * s}px ${22 * s}px`,
            fontFamily: theme.fonts.display,
            fontWeight: 800,
            fontSize: fitted * s,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
          }}
        >
          {ln.split(" ").map((word, wi) => {
            const p = spring({
              frame: frame - delay - index++ * theme.motion.stagger * (fps / 30),
              fps,
              config: theme.motion.springSnappy,
            });
            const hit = marks.has(clean(word));
            return (
              <span
                key={wi}
                style={{
                  display: "inline-block",
                  opacity: p,
                  transform: `translateY(${(1 - p) * 30 * s}px)`,
                  color: hit ? theme.colors.accentLight : theme.colors.ink,
                  textShadow: "0 4px 24px rgba(0,0,0,0.45)",
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
