import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, useSafeZone, useScale } from "../../brand";
import { HookText } from "../HookText";

export const SERIES_NAME = "Caught in the Machine";

export type EpisodeTitleProps = {
  ep: number;
  title: string;
  /** The cold-open hook, shown big under the series line (usually the first line of dialogue). */
  hook?: string;
  /** Word(s) of the hook in gold. */
  highlight?: string[];
  delay?: number;
  /** Frames on screen. Default 60 (2 s). */
  duration?: number;
};

/**
 * The cold open: "CAUGHT IN THE MACHINE · EP N · TITLE" plus the hook in big type,
 * for about 2 s at the top of the frame. Pair with DialogueCaptions hideBefore={duration}.
 */
export const EpisodeTitle: React.FC<EpisodeTitleProps> = ({
  ep,
  title,
  hook,
  highlight = [],
  delay = 0,
  duration = 60,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useScale();
  const safe = useSafeZone();
  const local = frame - delay;
  if (local < 0 || local >= duration) return null;
  const inP = spring({ frame: local, fps, config: theme.motion.springSnappy });
  const out = interpolate(local, [duration - 8, duration], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        top: safe.top + 110 * s,
        left: safe.left,
        right: safe.right,
        display: "flex",
        flexDirection: "column",
        gap: 22 * s,
        opacity: out,
      }}
    >
      <div
        style={{
          alignSelf: "flex-start",
          display: "flex",
          alignItems: "center",
          gap: 14 * s,
          padding: `${10 * s}px ${22 * s}px`,
          borderRadius: 999,
          background: theme.colors.accent,
          color: theme.colors.onAccent,
          fontFamily: theme.fonts.body,
          fontWeight: 800,
          fontSize: 26 * s,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          transform: `translateX(${(1 - inP) * -40 * s}px)`,
          opacity: inP,
        }}
      >
        {SERIES_NAME} · Ep {ep}
        <span style={{ opacity: 0.55 }}>·</span>
        <span style={{ letterSpacing: "0.06em" }}>{title}</span>
      </div>
      {hook ? <HookText lines={[hook]} highlight={highlight} delay={delay + 6} size={84} /> : null}
    </div>
  );
};
