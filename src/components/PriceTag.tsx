import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, useScale } from "../brand";

export type PriceTagProps = {
  /** Price shown before the flip, without "$" ("10.00"). Omit to show `to` only. */
  from?: string;
  /** Price after the flip, without "$" ("9.99"). */
  to: string;
  /** Frame (scene-relative) when the digits start rolling. */
  flipAt?: number;
  /** Entrance frame. */
  delay?: number;
  /** Frame when the left digit lights up gold and the rest of the price dims. */
  focusLeftAt?: number;
  /** Price font size in design px. Default 150. */
  size?: number;
};

const isDigit = (ch: string) => ch >= "0" && ch <= "9";
/** Frames between wheels starting: the right-hand wheel goes first, like an odometer. */
const WHEEL_STAGGER = 3;
/** Frames until a wheel looks settled (~97%) with theme.motion.spring. */
const SETTLE = 11;
/** Frames from `flipAt` to the final click for a 5-character price ("10.00"): the price-tag-roll SFX is cut to this. */
export const PRICE_TAG_LAND_FRAMES = 4 * WHEEL_STAGGER + SETTLE;

/**
 * A hanging price tag whose digits roll like an odometer from one price to
 * another ($10.00 → $9.99), then click into place.
 */
export const PriceTag: React.FC<PriceTagProps> = ({
  from,
  to,
  flipAt = 0,
  delay = 0,
  focusLeftAt,
  size = 150,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useScale();
  const c = theme.colors;
  const fs = size * s;

  const start = from ?? to;
  const n = Math.max(start.length, to.length);
  const a = start.padStart(n, " ");
  const b = to.padStart(n, " ");

  const appear = spring({ frame: frame - delay, fps, config: theme.motion.spring });

  // When the last wheel lands: a small "click" pulse on the tag.
  const land = flipAt + (n - 1) * WHEEL_STAGGER + SETTLE;
  const click = from
    ? interpolate(frame, [land - 3, land, land + 7], [0, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  const focus =
    focusLeftAt === undefined
      ? 0
      : spring({ frame: frame - focusLeftAt, fps, config: theme.motion.spring });
  const leftIndex = b.split("").findIndex((ch) => ch !== " ");

  const cellH = fs * 1.12;
  const digitW = fs * 0.66;
  const dotW = fs * 0.3;

  const columns = Array.from({ length: n }, (_, i) => {
    const x = a[i];
    const y = b[i];
    const wheel = spring({
      frame: frame - flipAt - (n - 1 - i) * WHEEL_STAGGER,
      fps,
      config: theme.motion.spring,
    });
    const isLeft = i === leftIndex;
    const tone: React.CSSProperties = {
      color: isLeft ? interpolateColor(focus) : c.ink,
      opacity: i > leftIndex ? 1 - 0.68 * focus : 1,
    };

    // Static character ("." or an unchanged digit).
    if (x === y) {
      const w = isDigit(y) ? digitW : y === " " ? 0 : dotW;
      return (
        <div key={i} style={{ width: w, height: cellH, textAlign: "center", ...tone }}>
          {y}
        </div>
      );
    }

    // Digit leaves (the "1" in 10.00): the wheel slides out and the gap closes.
    if (y === " ") {
      return (
        <div
          key={i}
          style={{
            width: digitW * (1 - wheel),
            height: cellH,
            overflow: "hidden",
            textAlign: "center",
            opacity: 1 - wheel,
            transform: `translateY(${-wheel * cellH * 0.5}px)`,
          }}
        >
          {x}
        </div>
      );
    }

    // Digit arrives from nothing.
    if (x === " ") {
      return (
        <div
          key={i}
          style={{
            width: digitW * wheel,
            height: cellH,
            overflow: "hidden",
            textAlign: "center",
            opacity: wheel,
            ...tone,
          }}
        >
          {y}
        </div>
      );
    }

    // Odometer wheel: count up from x to y (0 → 9 runs through every digit).
    const from0 = Number(x);
    const steps = (Number(y) - from0 + 10) % 10;
    const strip = Array.from({ length: steps + 1 }, (_, k) => String((from0 + k) % 10));
    return (
      <div key={i} style={{ width: digitW, height: cellH, overflow: "hidden", ...tone }}>
        <div style={{ transform: `translateY(${-wheel * steps * cellH}px)` }}>
          {strip.map((d, k) => (
            <div key={k} style={{ height: cellH, textAlign: "center" }}>
              {d}
            </div>
          ))}
        </div>
      </div>
    );
  });

  const hole = fs * 0.22;

  return (
    <div
      style={{
        position: "relative",
        alignSelf: "center",
        marginTop: fs * 0.3,
        opacity: appear,
        transform: `translateY(${(1 - appear) * 50 * s}px) scale(${1 + 0.045 * click})`,
      }}
    >
      {/* String */}
      <div
        style={{
          position: "absolute",
          left: fs * 0.32 + hole / 2 - 2 * s,
          top: -fs * 0.3,
          width: 4 * s,
          height: fs * 0.3 + fs * 0.46,
          background: c.inkMuted,
          opacity: 0.6,
          transform: "rotate(-14deg)",
          transformOrigin: "bottom center",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: fs * 0.12,
          padding: `${fs * 0.2}px ${fs * 0.34}px ${fs * 0.2}px ${fs * 0.28}px`,
          borderRadius: fs * 0.22,
          background: c.surface,
          border: `${5 * s}px solid ${click > 0.05 ? c.accentLight : c.accent}`,
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Punched hole */}
        <div
          style={{
            width: hole,
            height: hole,
            borderRadius: 999,
            background: c.bg,
            border: `${4 * s}px solid ${c.line}`,
            flexShrink: 0,
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            fontFamily: theme.fonts.display,
            fontWeight: 800,
            fontSize: fs,
            lineHeight: `${cellH}px`,
            letterSpacing: 0,
            color: c.ink,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <div style={{ fontSize: fs * 0.62, lineHeight: `${cellH * 0.8}px`, marginRight: fs * 0.04 }}>$</div>
          {columns}
        </div>
      </div>
    </div>
  );
};

// White → light gold as the left digit takes focus (both are theme colors).
const interpolateColor = (p: number) => (p > 0.5 ? theme.colors.accentLight : theme.colors.ink);
