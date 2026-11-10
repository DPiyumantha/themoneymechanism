import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";
import { theme, useSafeZone, useScale } from "../brand";

export type CaptionsProps = {
  /** Word-level timings of the voice-over (see the skill's production guide). */
  captions: Caption[];
  /** Words closer together than this share one caption page. 1000–1400 reads best. */
  combineWithinMs?: number;
};

/**
 * Burned-in captions, 2–4 words at a time, spoken word in gold.
 * Most viewers watch muted: use on every video with voice-over.
 */
export const Captions: React.FC<CaptionsProps> = ({ captions, combineWithinMs = 1200 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const safe = useSafeZone();
  const s = useScale();
  const { pages } = useMemo(
    () =>
      createTikTokStyleCaptions({
        captions,
        combineTokensWithinMilliseconds: combineWithinMs,
      }),
    [captions, combineWithinMs],
  );

  const ms = (frame / fps) * 1000;
  const page = pages.find((p) => ms >= p.startMs && ms < p.startMs + p.durationMs);
  if (!page) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: safe.left,
        right: safe.right,
        bottom: safe.bottom + 40 * s,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: "0.26em",
          maxWidth: 900 * s,
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: theme.type.caption * s,
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
          textAlign: "center",
        }}
      >
        {page.tokens.map((tok, i) => {
          const active = ms >= tok.fromMs && ms < tok.toMs;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                color: active ? theme.colors.accentLight : theme.colors.ink,
                textShadow: "0 3px 0 #000, 0 0 18px rgba(0,0,0,0.75)",
                // A lift, not a scale: scaling a long word ate the gap to its neighbour.
                transform: active ? "translateY(-0.05em)" : undefined,
              }}
            >
              {tok.text.trim()}
            </span>
          );
        })}
      </div>
    </div>
  );
};
