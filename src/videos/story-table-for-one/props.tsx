/**
 * Set pieces and props for "Table for One", flat vectors in the story kit's outlined style.
 * Generic kitchen, calendar, bags and cup; no real brand marks. Design px on a 1080-wide frame.
 */
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../brand";
import { useStage } from "../../components/story";

const INK = theme.colors.bg;
const C = theme.colors;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Full-frame SVG in design px (1080 wide). */
const Layer: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => {
  const { width, height } = useVideoConfig();
  const { s } = useStage();
  return (
    <AbsoluteFill style={style}>
      <svg width={width} height={height} viewBox={`0 0 ${width / s} ${height / s}`}>
        {children}
      </svg>
    </AbsoluteFill>
  );
};

const useGround = () => {
  const { groundY, s } = useStage();
  return groundY / s;
};

const text = (size: number, weight = 800) => ({
  fontFamily: theme.fonts.body,
  fontWeight: weight,
  fontSize: size,
});

// ─── Apartment kitchen ─────────────────────────────────────────────────────

const COUNTER = { left: 392, right: 688, height: 340 };

/** Upper cabinets, a window with warm light, the counter, a lone cupcake with one candle. */
export const Kitchen: React.FC = () => {
  const frame = useCurrentFrame();
  const g = useGround();
  const top = g - COUNTER.height;
  const flick = 1 + Math.sin(frame / 3) * 0.08 + Math.sin(frame / 1.7) * 0.05;
  return (
    <Layer>
      {/* window */}
      <g opacity={0.7}>
        <rect x={380} y={300} width={320} height={300} rx={10} fill={C.accentLight} fillOpacity={0.18} stroke={C.line} strokeWidth={6} />
        <line x1={540} y1={300} x2={540} y2={600} stroke={C.line} strokeWidth={5} />
        <line x1={380} y1={450} x2={700} y2={450} stroke={C.line} strokeWidth={5} />
      </g>
      {/* upper cabinets */}
      {[40, 770].map((x) => (
        <g key={x} opacity={0.75}>
          <rect x={x} y={250} width={270} height={300} rx={8} fill={C.surface} stroke={INK} strokeWidth={6} />
          <line x1={x + 135} y1={250} x2={x + 135} y2={550} stroke={INK} strokeWidth={4} />
          <rect x={x + 118} y={470} width={10} height={44} rx={4} fill={C.accentDeep} />
          <rect x={x + 142} y={470} width={10} height={44} rx={4} fill={C.accentDeep} />
        </g>
      ))}
      {/* counter */}
      <rect x={COUNTER.left} y={top + 22} width={COUNTER.right - COUNTER.left} height={COUNTER.height - 22} fill={C.surface} stroke={INK} strokeWidth={6} />
      <rect x={COUNTER.left - 14} y={top} width={COUNTER.right - COUNTER.left + 28} height={26} rx={6} fill={C.accentDeep} stroke={INK} strokeWidth={6} />
      {[0, 1].map((i) => (
        <rect key={i} x={COUNTER.left + 24 + i * 140} y={top + 52} width={120} height={g - top - 90} rx={8} fill="none" stroke={C.line} strokeWidth={4} />
      ))}
      {/* the lone cupcake */}
      <g transform={`translate(540 ${top})`}>
        <path d="M -42 -52 L 42 -52 L 32 -4 L -32 -4 Z" fill={C.inkMuted} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        {[-18, 0, 18].map((x) => (
          <line key={x} x1={x} y1={-50} x2={x * 0.8} y2={-6} stroke={INK} strokeWidth={3} opacity={0.6} />
        ))}
        <path d="M -46 -52 Q -50 -88 -20 -92 Q -16 -118 10 -110 Q 38 -112 40 -88 Q 52 -76 46 -52 Z" fill={C.accentLight} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <rect x={-3} y={-136} width={6} height={30} rx={2} fill={C.ink} stroke={INK} strokeWidth={2} />
        <g transform={`translate(0 -140) scale(${flick})`}>
          <ellipse cx={0} cy={-2} rx={22} ry={26} fill={C.accent} opacity={0.25} />
          <path d="M 0 -22 Q 9 -8 0 2 Q -9 -8 0 -22 Z" fill={C.accent} stroke={INK} strokeWidth={2} />
        </g>
      </g>
    </Layer>
  );
};

// ─── Calendar flip: 11/11 with four glowing gold ones ─────────────────────

/** A wall calendar page flips from "10" to 11/11, the four 1s glowing gold. Absolute frames. */
export const CalendarFlip: React.FC<{ at: number; until: number }> = ({ at, until }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at || frame >= until) return null;
  const pop = spring({ frame: frame - at, fps, config: theme.motion.springSnappy });
  const out = interpolate(frame, [until - 8, until], [1, 0], clamp);
  const flip = interpolate(frame, [at + 10, at + 18, at + 26], [1, 0.02, 1], clamp);
  const showNew = frame >= at + 18;
  const glow = interpolate(frame, [at + 22, at + 34], [0, 1], clamp) * (0.8 + 0.2 * Math.sin(frame / 4));
  const one = (x: number) => (
    <text
      x={x}
      y={0}
      textAnchor="middle"
      {...text(150, 900)}
      fill={C.accent}
      style={{ filter: `drop-shadow(0 0 ${16 * glow}px ${C.accent})` }}
    >
      1
    </text>
  );
  return (
    <Layer>
      <g transform={`translate(540 880) scale(${0.9 * pop * out})`} opacity={out}>
        <rect x={-230} y={-200} width={460} height={400} rx={26} fill={C.surface} stroke={INK} strokeWidth={8} />
        <rect x={-230} y={-200} width={460} height={78} rx={26} fill={C.accentDeep} stroke={INK} strokeWidth={8} />
        <text x={0} y={-146} textAnchor="middle" {...text(38)} fill={C.onAccent} letterSpacing={6}>
          NOVEMBER
        </text>
        {[-120, 120].map((x) => (
          <circle key={x} cx={x} cy={-204} r={12} fill={C.inkMuted} stroke={INK} strokeWidth={4} />
        ))}
        <g transform={`translate(0 70) scale(1 ${flip})`}>
          {showNew ? (
            <>
              {one(-150)}
              {one(-60)}
              <text x={0} y={-8} textAnchor="middle" {...text(120, 900)} fill={C.ink}>
                /
              </text>
              {one(60)}
              {one(150)}
            </>
          ) : (
            <text x={0} y={0} textAnchor="middle" {...text(150, 900)} fill={C.ink}>
              10
            </text>
          )}
        </g>
      </g>
    </Layer>
  );
};

// ─── Coffee cup slid across the counter, with a tag check ─────────────────

/** Maya slides a plain cup along the counter; Jake lifts it and checks for a price tag (a blank "?"). */
export const CoffeeSlide: React.FC<{ at: number; checkAt: number }> = ({ at, checkAt }) => {
  const frame = useCurrentFrame();
  const g = useGround();
  if (frame < at) return null;
  const top = g - COUNTER.height;
  const t = interpolate(frame, [at, at + 22], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) * (1 - x) });
  const x = interpolate(t, [0, 1], [430, 640]);
  const lift = interpolate(frame, [checkAt, checkAt + 12], [0, 1], clamp);
  const tilt = lift * Math.sin(frame / 3) * 6;
  const y = top - lift * 40;
  const tag = interpolate(frame, [checkAt + 6, checkAt + 16], [0, 1], clamp);
  return (
    <Layer>
      <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
        <path d="M -30 -96 L 30 -96 L 22 0 L -22 0 Z" fill={C.surface} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -27 -62 L 27 -62 L 24 -30 L -24 -30 Z" fill={C.accentDeep} stroke={INK} strokeWidth={4} />
        <rect x={-35} y={-112} width={70} height={18} rx={6} fill={C.inkMuted} stroke={INK} strokeWidth={5} />
        <path d="M 30 -70 Q 62 -66 54 -34 Q 50 -22 26 -26" fill="none" stroke={INK} strokeWidth={5} />
        {[0, 1].map((i) => (
          <path key={i} d={`M ${-8 + i * 16} -128 q 8 -10 0 -20`} fill="none" stroke={C.ink} strokeWidth={3} opacity={0.45} />
        ))}
        {tag > 0 ? (
          <g transform={`translate(-30 -40) rotate(${-14 + tag * 14}) scale(${tag})`}>
            <line x1={0} y1={0} x2={-26} y2={30} stroke={INK} strokeWidth={3} />
            <g transform="translate(-26 30)">
              <rect x={-26} y={0} width={52} height={36} rx={6} fill={C.accent} stroke={INK} strokeWidth={4} />
              <text x={0} y={28} textAnchor="middle" {...text(28)} fill={C.onAccent}>
                ?
              </text>
            </g>
          </g>
        ) : null}
      </g>
    </Layer>
  );
};

// ─── Mechanism Moment graphic ─────────────────────────────────────────────

const Bag: React.FC<{ x: number; y: number; s: number; tone: string }> = ({ x, y, s, tone }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -22 -34 Q -22 -56 0 -56 Q 22 -56 22 -34" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
    <path d="M -34 -36 L 34 -36 L 40 0 L -40 0 Z" fill={tone} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -16 -20 Q 0 -8 16 -20" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={0.6} />
  </g>
);

/**
 * Four "1" dominoes topple one after another, each turning into a shopping bag; then a
 * 2009 -> 2021 timeline draws with a gold bar to the last published total. Frames are absolute.
 */
export const OnesToBags: React.FC<{ delay: number; fallAt: number; barAt: number }> = ({ delay, fallAt, barAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { s } = useStage();
  const enter = spring({ frame: frame - delay, fps, config: theme.motion.spring });
  const W = 700;
  const H = 520;
  const bar = interpolate(frame, [barAt, barAt + 40], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const dot = interpolate(frame, [barAt - 8, barAt + 6], [0, 1], clamp);
  const gold = interpolate(frame, [barAt + 36, barAt + 48], [0, 1], clamp);
  return (
    <div style={{ alignSelf: "center", opacity: enter, transform: `translateY(${(1 - enter) * 40 * s}px)` }}>
      <svg width={W * 0.62 * s} height={H * 0.62 * s} viewBox={`0 0 ${W} ${H}`}>
        <line x1={60} y1={170} x2={640} y2={170} stroke={C.line} strokeWidth={4} />
        {[0, 1, 2, 3].map((i) => {
          const f = fallAt + i * 9;
          const p = interpolate(frame, [f, f + 12], [0, 1], { ...clamp, easing: (x) => x * x });
          const x = 150 + i * 133;
          const bagIn = interpolate(frame, [f + 10, f + 20], [0, 1], clamp);
          return (
            <g key={i}>
              {bagIn < 1 ? (
                <g transform={`translate(${x} 170) rotate(${p * 82})`} opacity={1 - bagIn}>
                  <rect x={-24} y={-110} width={48} height={110} rx={8} fill={C.accent} stroke={INK} strokeWidth={5} />
                  <text x={0} y={-44} textAnchor="middle" {...text(76, 900)} fill={C.onAccent}>
                    1
                  </text>
                </g>
              ) : null}
              {bagIn > 0 ? <Bag x={x + 12} y={170} s={bagIn * 1.25} tone={i % 2 ? C.accent : C.accentLight} /> : null}
            </g>
          );
        })}
        <g transform="translate(0 250)" opacity={interpolate(frame, [barAt - 10, barAt + 4], [0, 1], clamp)}>
          <line x1={80} y1={150} x2={620} y2={150} stroke={C.inkMuted} strokeWidth={6} strokeLinecap="round" />
          <circle cx={80} cy={150} r={14} fill={C.accent} stroke={INK} strokeWidth={4} />
          <text x={80} y={198} textAnchor="middle" {...text(34)} fill={C.ink}>
            2009
          </text>
          <circle cx={620} cy={150} r={14 * dot} fill={C.accent} stroke={INK} strokeWidth={4} />
          <text x={620} y={198} textAnchor="middle" {...text(34)} fill={C.ink} opacity={dot}>
            2021
          </text>
          <rect x={64} y={141} width={32} height={9} fill={C.accent} />
          <rect x={604} y={150 - 130 * bar} width={32} height={130 * bar} rx={4} fill={C.accent} stroke={INK} strokeWidth={4} />
          <text x={620} y={150 - 130 * bar - 14} textAnchor="middle" {...text(40, 900)} fill={C.accent} opacity={bar > 0.2 ? 1 : 0}>
            $84.5B
          </text>
          <ellipse cx={620} cy={20} rx={70} ry={24} fill={C.accent} opacity={0.25 * gold} />
        </g>
      </svg>
    </div>
  );
};
