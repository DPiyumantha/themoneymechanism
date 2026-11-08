import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, useScale } from "../brand";

export type PumpCounterProps = {
  /** Total the dollar counter spins up to (50 → "$50.00"). */
  total: number;
  /** Price per gallon, for the gallons row (4.10). */
  pricePerGallon: number;
  /** Entrance frame. */
  delay?: number;
  /** Frame the numbers start running. Default: 10 frames after the entrance. */
  startAt?: number;
  /** Frames the count takes. Default 45. */
  countFrames?: number;
};

/**
 * A gas pump display: dollars and gallons spin up like an odometer, the last
 * digit rolling past, until the sale locks at `total`.
 */
export const PumpCounter: React.FC<PumpCounterProps> = ({
  total,
  pricePerGallon,
  delay = 0,
  startAt,
  countFrames = 45,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useScale();
  const c = theme.colors;
  const start = startAt ?? delay + 10;

  const appear = spring({ frame: frame - delay, fps, config: theme.motion.spring });
  const t = interpolate(frame, [start, start + countFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const done = frame >= start + countFrames;
  const lock = interpolate(frame, [start + countFrames, start + countFrames + 8], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const dollars = total * t;
  const gallons = (total / pricePerGallon) * t;

  /** Digits with an odometer-rolling last digit while the pump runs. */
  const readout = (value: number, decimals: number, size: number, gold = false) => {
    const fs = size * s;
    const cellH = fs * 1.1;
    const scaled = Math.round(value * 10 ** decimals * 1000) / 1000; // no float drift (4.10 → 409.999…)
    const whole = Math.floor(scaled);
    const frac = done ? 0 : scaled - whole; // last wheel position between digits
    const text = (whole / 10 ** decimals).toFixed(decimals);
    const head = text.slice(0, -1);
    const last = Number(text.slice(-1));
    return (
      <div
        style={{
          display: "flex",
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: fs,
          lineHeight: `${cellH}px`,
          letterSpacing: "-0.02em",
          color: gold ? c.accentLight : c.ink,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <span>{head}</span>
        <div style={{ height: cellH, overflow: "hidden" }}>
          <div style={{ transform: `translateY(${-frac * cellH}px)` }}>
            <div style={{ height: cellH }}>{last}</div>
            <div style={{ height: cellH }}>{(last + 1) % 10}</div>
          </div>
        </div>
      </div>
    );
  };

  const row = (label: string, child: React.ReactNode) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 30 * s,
        padding: `${18 * s}px ${36 * s}px`,
        borderRadius: 18 * s,
        background: c.bg,
        border: `${3 * s}px solid ${c.line}`,
      }}
    >
      <div
        style={{
          fontFamily: theme.fonts.body,
          fontWeight: 700,
          fontSize: theme.type.kicker * s,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: c.inkMuted,
        }}
      >
        {label}
      </div>
      {child}
    </div>
  );

  return (
    <div
      style={{
        alignSelf: "center",
        width: 760 * s,
        display: "flex",
        flexDirection: "column",
        gap: 18 * s,
        padding: 30 * s,
        borderRadius: 30 * s,
        background: c.surface,
        border: `${5 * s}px solid ${lock > 0.05 ? c.accentLight : c.accent}`,
        boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        opacity: appear,
        transform: `translateY(${(1 - appear) * 50 * s}px) scale(${1 + 0.03 * lock})`,
      }}
    >
      {row("Sale $", readout(dollars, 2, 130, true))}
      {row("Gallons", readout(gallons, 3, 72))}
      {row("Per gallon", readout(pricePerGallon, 2, 52))}
    </div>
  );
};
