/** Vector graphics for "Beef up, eggs way down". Theme tokens only; no brand marks. */
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, useScale } from "../../brand";

const c = theme.colors;

/** A ribeye steak: rounded cut with a fat rim and marbling. 200 x 140 box. */
export const Steak: React.FC<{ size?: number }> = ({ size = 200 }) => (
  <svg viewBox="0 0 200 140" width={size} height={size * 0.7} style={{ overflow: "visible" }}>
    <path
      d="M 25 70 C 15 30 70 8 120 14 C 175 20 195 55 180 95 C 165 130 105 135 65 128 C 35 122 30 95 25 70 Z"
      fill={c.negative}
      stroke={c.ink}
      strokeWidth={9}
      strokeLinejoin="round"
    />
    <path d="M 60 50 C 85 35 120 40 140 55" fill="none" stroke={c.ink} strokeWidth={6} strokeLinecap="round" opacity={0.85} />
    <path d="M 70 90 C 95 100 130 98 155 80" fill="none" stroke={c.ink} strokeWidth={6} strokeLinecap="round" opacity={0.85} />
    <ellipse cx={108} cy={68} rx={20} ry={14} fill={c.surface} opacity={0.85} />
  </svg>
);

/** An open egg carton with six eggs. 200 x 140 box. */
export const EggCarton: React.FC<{ size?: number }> = ({ size = 200 }) => (
  <svg viewBox="0 0 200 140" width={size} height={size * 0.7} style={{ overflow: "visible" }}>
    {[0, 1, 2].map((i) => (
      <ellipse key={`b${i}`} cx={40 + i * 60} cy={50} rx={24} ry={30} fill={c.ink} />
    ))}
    {[0, 1, 2].map((i) => (
      <ellipse key={`f${i}`} cx={40 + i * 60} cy={95} rx={24} ry={30} fill={c.ink} />
    ))}
    <path d="M 5 70 L 195 70 L 185 130 L 15 130 Z" fill={c.surface} stroke={c.inkMuted} strokeWidth={7} strokeLinejoin="round" />
    {[0, 1, 2].map((i) => (
      <path key={`c${i}`} d={`M ${22 + i * 60} 84 L ${58 + i * 60} 84 L ${54 + i * 60} 118 L ${26 + i * 60} 118 Z`} fill={c.bgAlt} />
    ))}
  </svg>
);

/**
 * Seesaw: the steak side rises and the egg-carton side drops.
 * `tiltAt` = frame the plank starts moving.
 */
export const Seesaw: React.FC<{ delay?: number; tiltAt?: number }> = ({ delay = 0, tiltAt = 20 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useScale();
  const enter = spring({ frame: frame - delay, fps, config: theme.motion.spring });
  const tilt = spring({ frame: frame - tiltAt, fps, config: theme.motion.spring });
  const angle = interpolate(tilt, [0, 1], [0, 13]);
  const W = 680;
  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center", opacity: enter }}>
      <svg viewBox="0 0 800 520" width={W * s} height={((W * 520) / 800) * s} style={{ overflow: "visible" }}>
        <g transform={`rotate(${-angle} 400 400)`}>
          <rect x={30} y={392} width={740} height={22} rx={11} fill={c.accent} />
          <g transform="translate(70 260)">
            <Steak size={200} />
          </g>
          <g transform="translate(540 260)">
            <EggCarton size={200} />
          </g>
        </g>
        <path d="M 400 400 L 340 500 L 460 500 Z" fill={c.surface} stroke={c.line} strokeWidth={4} strokeLinejoin="round" />
        <text x={170} y={60} textAnchor="middle" fontFamily={theme.fonts.display} fontWeight={800} fontSize={54} fill={c.negative} opacity={tilt}>
          +8.7%
        </text>
        <text x={640} y={60} textAnchor="middle" fontFamily={theme.fonts.display} fontWeight={800} fontSize={54} fill={c.positive} opacity={tilt}>
          {"−29.3%"}
        </text>
      </svg>
    </div>
  );
};

export type DivDatum = { label: string; value: number; display: string };

/** Horizontal bars from a zero line: increases go right, drops go left. One common scale. */
export const DivergingBars: React.FC<{
  data: DivDatum[];
  highlight: number;
  delay?: number;
  stepFrames?: number;
  /** Entrance frame per bar (overrides delay + stepFrames). */
  at?: number[];
}> = ({ data, highlight, delay = 0, stepFrames = 12, at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useScale();
  const min = Math.min(...data.map((d) => d.value));
  const leftW = 340; // design px for the full negative side
  const px = leftW / Math.abs(min);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 * s, width: "100%" }}>
      {data.map((d, i) => {
        const p = spring({ frame: frame - (at ? at[i] : delay + i * stepFrames), fps, config: theme.motion.spring });
        const hit = i === highlight;
        const neg = d.value < 0;
        const len = Math.abs(d.value) * px * p;
        return (
          <div key={d.label} style={{ display: "flex", flexDirection: "column", gap: 8 * s, opacity: Math.min(1, p * 2) }}>
            <div style={{ fontFamily: theme.fonts.body, fontWeight: 600, fontSize: 32 * s, color: hit ? c.ink : c.inkMuted }}>{d.label}</div>
            <div style={{ position: "relative", height: 62 * s, width: "100%" }}>
              <div style={{ position: "absolute", left: leftW * s, top: -6 * s, bottom: -6 * s, width: 3 * s, background: c.line }} />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  height: "100%",
                  width: len * s,
                  left: neg ? (leftW - len) * s : leftW * s,
                  borderRadius: 8 * s,
                  background: neg
                    ? `linear-gradient(90deg, ${c.accentDeep}, ${c.accentLight})`
                    : "linear-gradient(90deg, rgba(242,184,36,0.45), rgba(242,184,36,0.15))",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  height: "100%",
                  left: neg ? (leftW - len) * s + 18 * s : (leftW + len + 16) * s,
                  display: "flex",
                  alignItems: "center",
                  fontFamily: theme.fonts.display,
                  fontWeight: 800,
                  fontSize: (hit ? 50 : 40) * s,
                  color: neg ? c.onAccent : hit ? c.accentLight : c.ink,
                  fontVariantNumeric: "tabular-nums",
                  opacity: p,
                  whiteSpace: "nowrap",
                }}
              >
                {d.display}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Two-panel text split-screen meme: 2025 egg hoarding vs 2026 steak. */
export const SplitMeme: React.FC<{ delay?: number; secondAt?: number }> = ({ delay = 0, secondAt = 40 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useScale();
  const a = spring({ frame: frame - delay, fps, config: theme.motion.spring });
  const b = spring({ frame: frame - secondAt, fps, config: theme.motion.spring });
  const panel = (label: string, caption: string, icon: React.ReactNode, p: number, gold: boolean) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 28 * s,
        padding: `${26 * s}px ${34 * s}px`,
        borderRadius: 28 * s,
        background: c.surface,
        border: `${4 * s}px solid ${gold ? c.accent : "transparent"}`,
        opacity: p,
        transform: `translateY(${(1 - p) * 40 * s}px)`,
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: theme.fonts.body,
            fontWeight: 700,
            fontSize: theme.type.kicker * s,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: gold ? c.accentLight : c.inkMuted,
          }}
        >
          {label}
        </div>
        <div style={{ fontFamily: theme.fonts.display, fontWeight: 800, fontSize: 52 * s, lineHeight: 1.1, color: c.ink, marginTop: 10 * s }}>
          {caption}
        </div>
      </div>
      <div style={{ width: 230 * s, display: "flex", justifyContent: "center" }}>{icon}</div>
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 34 * s, width: "100%" }}>
      {panel("Me in 2025", "Hoarding eggs", <EggCarton size={220 * s} />, a, false)}
      {panel("Me in 2026", "Buying steak", <Steak size={220 * s} />, b, true)}
    </div>
  );
};
