import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, useScale } from "../brand";

export type StatCardProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  /** What the number means, under 10 words. */
  label: string;
  /** Colored up/down arrow. */
  trend?: "up" | "down";
  delay?: number;
  /** Frames the count-up takes. */
  countFrames?: number;
};

/** One big gold number that counts up, with a short label. The proof of a point. */
export const StatCard: React.FC<StatCardProps> = ({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  label,
  trend,
  delay = 0,
  countFrames = 30,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useScale();
  const appear = spring({ frame: frame - delay, fps, config: theme.motion.spring });
  const n = interpolate(frame, [delay, delay + countFrames], [0, value], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const trendColor = trend === "down" ? theme.colors.negative : theme.colors.positive;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18 * s,
        opacity: appear,
        transform: `scale(${0.92 + 0.08 * appear})`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20 * s,
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: theme.type.bigNumber * s,
          lineHeight: 1,
          letterSpacing: "-0.04em",
          color: theme.colors.accentLight,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {trend ? (
          <svg
            width={110 * s}
            height={110 * s}
            viewBox="0 0 24 24"
            fill="none"
            stroke={trendColor}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {trend === "up" ? <path d="M12 20V4M5 11l7-7 7 7" /> : <path d="M12 4v16M5 13l7 7 7-7" />}
          </svg>
        ) : null}
        {prefix}
        {n.toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}
        {suffix}
      </div>
      <div
        style={{
          fontFamily: theme.fonts.body,
          fontWeight: 600,
          fontSize: theme.type.body * s,
          color: theme.colors.inkMuted,
          textAlign: "center",
          maxWidth: 860 * s,
        }}
      >
        {label}
      </div>
    </div>
  );
};
