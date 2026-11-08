import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, useScale } from "../brand";

export type ExpectationRealityProps = {
  /** Line in the Expectation panel ("Me: I'll just grab milk"). */
  expectation: string;
  /** Line in the Reality panel. Optional. */
  reality?: string;
  /** Entrance frame for the Expectation panel. */
  delay?: number;
  /** Frame the Reality panel lands and the cart starts filling. */
  realityAt?: number;
};

const panelLabel = (text: string, gold: boolean, s: number) => (
  <div
    style={{
      fontFamily: theme.fonts.body,
      fontWeight: 700,
      fontSize: theme.type.kicker * s,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color: gold ? theme.colors.accentLight : theme.colors.inkMuted,
    }}
  >
    {text}
  </div>
);

/** The original "Expectation vs Reality" meme: one carton of milk vs an overflowing cart (vector, no brands). */
export const ExpectationReality: React.FC<ExpectationRealityProps> = ({
  expectation,
  reality,
  delay = 0,
  realityAt = 40,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useScale();
  const c = theme.colors;
  const a = spring({ frame: frame - delay, fps, config: theme.motion.spring });
  const b = spring({ frame: frame - realityAt, fps, config: theme.motion.spring });

  const panel: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 30 * s,
    padding: `${26 * s}px ${34 * s}px`,
    borderRadius: 28 * s,
    background: c.surface,
  };

  // Boxes stacked in the cart, popping in one after another (x, y, w, h).
  const boxes: [number, number, number, number][] = [
    [40, 120, 90, 70], [135, 120, 80, 70], [220, 120, 90, 70],
    [55, 55, 100, 65], [160, 50, 85, 70], [250, 60, 60, 60],
    [85, -5, 70, 60], [165, -15, 95, 65], [120, -70, 80, 55],
  ];

  const milk = (
    <svg viewBox="0 0 120 180" width={110 * s} height={165 * s}>
      <path d="M 20 60 L 60 20 L 100 60 L 100 170 L 20 170 Z" fill={c.ink} stroke={c.inkMuted} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 40 10 L 80 10 L 60 20 Z" fill={c.ink} stroke={c.inkMuted} strokeWidth={4} strokeLinejoin="round" />
      <rect x={34} y={95} width={52} height={40} rx={6} fill={c.bgAlt} />
    </svg>
  );

  const cart = (
    <svg viewBox="-40 -90 400 330" width={330 * s} height={275 * s} style={{ overflow: "visible" }}>
      {boxes.map(([x, y, w, h], k) => {
        const p = spring({ frame: frame - realityAt - 6 - k * 3, fps, config: theme.motion.springSnappy });
        return (
          <rect
            key={k}
            x={x}
            y={y - 40 * (1 - p)}
            width={w}
            height={h}
            rx={8}
            fill={c.bgAlt}
            stroke={k === boxes.length - 1 ? c.accent : c.inkMuted}
            strokeWidth={5}
            opacity={p}
          />
        );
      })}
      {/* Cart basket, handle and wheels */}
      <path d="M 0 110 L 30 110 L 55 200 L 300 200 L 330 110 L 30 110" fill="none" stroke={c.ink} strokeWidth={9} strokeLinejoin="round" />
      <path d="M 0 110 L -30 70" stroke={c.ink} strokeWidth={9} strokeLinecap="round" />
      <circle cx={85} cy={225} r={16} fill={c.bg} stroke={c.ink} strokeWidth={8} />
      <circle cx={270} cy={225} r={16} fill={c.bg} stroke={c.ink} strokeWidth={8} />
    </svg>
  );

  const line = (text: string) => (
    <div style={{ fontFamily: theme.fonts.display, fontWeight: 800, fontSize: 50 * s, letterSpacing: "-0.02em", color: c.ink }}>
      {text}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 * s }}>
      <div style={{ ...panel, opacity: a, transform: `translateY(${(1 - a) * 40 * s}px)` }}>
        {milk}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 * s }}>
          {panelLabel("Expectation", false, s)}
          {line(expectation)}
        </div>
      </div>
      <div
        style={{
          ...panel,
          border: `${4 * s}px solid ${c.line}`,
          opacity: b,
          transform: `translateY(${(1 - b) * 60 * s}px)`,
        }}
      >
        {cart}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 * s }}>
          {panelLabel("Reality", true, s)}
          {reality ? line(reality) : null}
        </div>
      </div>
    </div>
  );
};
