import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, useScale } from "../brand";

export type VersusSide = {
  /** Short label ("You pay", "It costs them"). */
  label: string;
  /** The figure ("$5.75", "$0.40"). */
  value: string;
  /** Optional line under the figure. */
  note?: string;
};

export type VersusCardProps = {
  left: VersusSide;
  right: VersusSide;
  /** Which side is the reveal (gold). Default "right". */
  emphasis?: "left" | "right";
  delay?: number;
};

/** Two figures side by side: price vs cost, before vs after, them vs you. */
export const VersusCard: React.FC<VersusCardProps> = ({
  left,
  right,
  emphasis = "right",
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useScale();
  const c = theme.colors;
  const gap = 18 * (fps / 30);

  const panel = (side: VersusSide, hot: boolean, d: number) => {
    const p = spring({ frame: frame - d, fps, config: theme.motion.spring });
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14 * s,
          padding: `${44 * s}px ${20 * s}px`,
          borderRadius: 28 * s,
          background: c.surface,
          border: `${4 * s}px solid ${hot ? c.accent : "rgba(255,255,255,0.08)"}`,
          opacity: p,
          transform: `translateY(${(1 - p) * 40 * s}px)`,
        }}
      >
        <div
          style={{
            fontFamily: theme.fonts.body,
            fontWeight: 700,
            fontSize: 28 * s,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: hot ? c.accent : c.inkMuted,
          }}
        >
          {side.label}
        </div>
        <div
          style={{
            fontFamily: theme.fonts.display,
            fontWeight: 800,
            fontSize: 112 * s,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            color: hot ? c.accentLight : c.ink,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {side.value}
        </div>
        {side.note ? (
          <div
            style={{
              fontFamily: theme.fonts.body,
              fontWeight: 500,
              fontSize: 30 * s,
              color: c.inkMuted,
              textAlign: "center",
            }}
          >
            {side.note}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: 24 * s, width: "100%" }}>
      {panel(left, emphasis === "left", delay)}
      {panel(right, emphasis === "right", delay + gap)}
    </div>
  );
};
