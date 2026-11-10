/**
 * Set pieces and props for "Family Size", flat vectors in the story kit's outlined style.
 * The chip bag is deliberately generic: no brand, no logo, no real packaging.
 * Design px on a 1080-wide frame; `Layer` maps that onto the real frame.
 */
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../brand";
import { useStage } from "../../components/story";

const INK = theme.colors.bg;
const C = theme.colors;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const smooth = (x: number) => x * x * (3 - 2 * x);

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

// ─── Chip bag ──────────────────────────────────────────────────────────────

/**
 * A generic chip bag, bottom center at (0,0), 200 wide × 290 tall at scale 1. `fill` is how much of
 * the bag the chips fill (0–1); the rest is air. `puff` squashes the bag (1 = full, lower = deflated).
 */
const BagShape: React.FC<{ fill?: number; puff?: number; label?: string }> = ({ fill = 0.9, puff = 1, label = "CHIPS" }) => {
  const clipId = `bagClip${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const w = 100 * (0.62 + 0.38 * puff);
  const h = 290 * (0.5 + 0.5 * puff);
  const bulge = 26 * puff;
  const top = -h;
  const chipTop = -h * 0.16 - (h - h * 0.3) * fill;
  const crimp = (y: number, dir: 1 | -1) => {
    let d = "";
    for (let i = -w; i <= w; i += 20) d += ` L ${i + 10} ${y + dir * 9} L ${i + 20} ${y}`;
    return d;
  };
  return (
    <g>
      <path
        d={`M ${-w} ${top} ${crimp(top, 1)} L ${w} ${top} Q ${w + bulge} ${top + h / 2} ${w} 0 ${crimp(0, -1).replace(/L/g, "L")} L ${-w} 0 Q ${-w - bulge} ${top + h / 2} ${-w} ${top} Z`}
        fill={C.accent}
        stroke={INK}
        strokeWidth={6}
        strokeLinejoin="round"
      />
      {/* chips resting at the bottom: how full the bag really is */}
      <clipPath id={clipId}>
        <path d={`M ${-w} ${top + 12} L ${w} ${top + 12} Q ${w + bulge} ${top + h / 2} ${w} 0 L ${-w} 0 Q ${-w - bulge} ${top + h / 2} ${-w} ${top + 12} Z`} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <rect x={-w - bulge} y={chipTop} width={(w + bulge) * 2} height={-chipTop + 2} fill={C.accentDeep} opacity={0.85} />
        {[-0.55, -0.1, 0.4, -0.3, 0.15, 0.6].map((k, i) => (
          <path
            key={i}
            d={`M ${k * w - 14} ${chipTop + 4 + (i % 2) * 18} l 14 -22 l 14 22 z`}
            fill={C.accentLight}
            stroke={INK}
            strokeWidth={3}
            strokeLinejoin="round"
          />
        ))}
      </g>
      <text x={0} y={top + h * 0.34} textAnchor="middle" {...text(30)} fill={C.onAccent} letterSpacing={3} opacity={Math.min(1, puff * 1.2)}>
        {label}
      </text>
      <text x={0} y={top + h * 0.46} textAnchor="middle" {...text(18, 700)} fill={C.onAccent} letterSpacing={4} opacity={Math.min(1, puff * 1.2)}>
        FAMILY SIZE
      </text>
    </g>
  );
};

// ─── Living room ───────────────────────────────────────────────────────────

/** A couch and a glowing TV behind the characters, a coffee table and a bowl up front. */
export const LivingRoom: React.FC = () => {
  const frame = useCurrentFrame();
  const g = useGround();
  const flicker = 0.28 + 0.05 * Math.sin(frame / 5);
  return (
    <Layer>
      {/* TV glow */}
      <ellipse cx={540} cy={g - 520} rx={420} ry={300} fill={C.accentLight} opacity={flicker * 0.5} />
      <g>
        <rect x={300} y={g - 780} width={480} height={280} rx={14} fill={C.surface} stroke={INK} strokeWidth={8} />
        <rect x={316} y={g - 764} width={448} height={248} rx={8} fill={C.accent} opacity={flicker + 0.2} />
        <rect x={480} y={g - 500} width={120} height={20} fill={C.bgAlt} stroke={INK} strokeWidth={5} />
        <rect x={430} y={g - 482} width={220} height={14} rx={6} fill={C.inkMuted} stroke={INK} strokeWidth={4} />
      </g>
      {/* lamp */}
      <g opacity={0.8}>
        <line x1={110} y1={g - 330} x2={110} y2={g - 30} stroke={C.line} strokeWidth={8} />
        <path d={`M 60 ${g - 330} L 160 ${g - 330} L 134 ${g - 410} L 86 ${g - 410} Z`} fill={C.accentDeep} stroke={INK} strokeWidth={5} />
        <ellipse cx={110} cy={g - 300} rx={110} ry={50} fill={C.accentLight} opacity={0.18} />
      </g>
      {/* couch behind the characters */}
      <rect x={90} y={g - 330} width={900} height={250} rx={46} fill={C.bgAlt} stroke={INK} strokeWidth={8} />
      <rect x={60} y={g - 250} width={110} height={200} rx={38} fill={C.surface} stroke={INK} strokeWidth={8} />
      <rect x={910} y={g - 250} width={110} height={200} rx={38} fill={C.surface} stroke={INK} strokeWidth={8} />
      <line x1={540} y1={g - 320} x2={540} y2={g - 100} stroke={INK} strokeWidth={5} opacity={0.5} />
    </Layer>
  );
};

/** Jake's bag, held near his hip. Puffed full until `deflateAt`; static afterwards. */
export const JakesBag: React.FC<{ x?: number; bounceAt?: number; fill?: number }> = ({ x = 880, fill = 0.45 }) => {
  const g = useGround();
  return (
    <Layer>
      <g transform={`translate(${x} ${g - 40}) scale(0.62) rotate(6)`}>
        <BagShape fill={fill} />
      </g>
    </Layer>
  );
};

// ─── Bag-opening shot (slow motion) ────────────────────────────────────────

/**
 * Close-up: the bag puffs open with a pop, then a single chip falls out in slow motion.
 * Runs from `at` for `duration` frames, full width over the scene.
 */
export const BagOpening: React.FC<{ at: number; duration?: number }> = ({ at, duration = 66 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const g = useGround();
  const t = frame - at;
  if (t < 0 || t >= duration) return null;
  const pop = spring({ frame: t, fps, config: { damping: 8, stiffness: 180 } });
  const out = interpolate(t, [duration - 8, duration], [1, 0], clamp);
  const puff = 0.78 + 0.22 * pop;
  // slow-mo fall: starts at the bag mouth, drifts and turns
  const fall = smooth(interpolate(t, [14, duration - 4], [0, 1], clamp));
  const chipY = -380 + fall * 330;
  const chipX = Math.sin(fall * Math.PI * 1.5) * 26;
  const chipRot = fall * 200;
  return (
    <Layer style={{ opacity: out }}>
      <rect x={0} y={0} width={1080} height={3000} fill={C.bg} opacity={0.55} />
      <g transform={`translate(540 ${g - 330}) scale(1.35)`}>
        <BagShape fill={0.22} puff={puff} />
        {/* burst lines */}
        {t < 14
          ? [-50, -25, 0, 25, 50].map((a) => (
              <line key={a} x1={0} y1={-310 * puff} x2={a * 2.2} y2={-380 * puff - 20} stroke={C.accentLight} strokeWidth={6} strokeLinecap="round" opacity={1 - t / 14} />
            ))
          : null}
        <g transform={`translate(${chipX} ${chipY}) rotate(${chipRot})`} opacity={t < 14 ? 0 : 1}>
          <path d="M -26 14 L 0 -34 L 26 14 Z" fill={C.accentLight} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        </g>
      </g>
      <text x={540} y={g - 780} textAnchor="middle" {...text(54)} fill={C.ink} opacity={interpolate(t, [24, 36], [0, 1], clamp)}>
        One chip.
      </text>
    </Layer>
  );
};

// ─── Expectation vs Reality (original, bag edition) ───────────────────────

/** Split panel: Expectation = full bag, Reality = mostly air. Appears over the scene. */
export const BagExpectation: React.FC<{ at: number; until: number }> = ({ at, until }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { s } = useStage();
  if (frame < at || frame >= until) return null;
  const a = spring({ frame: frame - at, fps, config: theme.motion.spring });
  const b = spring({ frame: frame - at - 18, fps, config: theme.motion.spring });
  const out = interpolate(frame, [until - 8, until], [1, 0], clamp);
  const label = (txt: string, gold: boolean) => (
    <text x={0} y={-340} textAnchor="middle" {...text(34, 700)} letterSpacing={6} fill={gold ? C.accentLight : C.inkMuted}>
      {txt}
    </text>
  );
  return (
    <Layer style={{ opacity: out }}>
      <rect x={0} y={0} width={1080} height={3000} fill={C.bg} opacity={0.93} />
      <g transform={`translate(0 ${(1 - a) * 60 * s}) `} opacity={a}>
        <g transform="translate(290 1180)">
          {label("EXPECTATION", false)}
          <g transform="scale(0.95)">
            <BagShape fill={0.92} />
          </g>
        </g>
      </g>
      <g transform={`translate(0 ${(1 - b) * 60 * s})`} opacity={b}>
        <g transform="translate(790 1180)">
          {label("REALITY", true)}
          <g transform="scale(0.95)">
            <BagShape fill={0.1} />
          </g>
        </g>
      </g>
      <line x1={540} y1={780} x2={540} y2={1200} stroke={C.line} strokeWidth={4} strokeDasharray="14 14" opacity={a} />
    </Layer>
  );
};

// ─── Ounce odometer (Jake reads the weight) ───────────────────────────────

/** "9.75 oz" ticking down to "9.25 oz" near the top of the frame, like an odometer. */
export const OunceTicker: React.FC<{ at: number; until: number }> = ({ at, until }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { s } = useStage();
  if (frame < at || frame >= until) return null;
  const pop = spring({ frame: frame - at, fps, config: theme.motion.springSnappy });
  const out = interpolate(frame, [until - 8, until], [1, 0], clamp);
  const v = interpolate(frame, [at + 12, at + 40], [9.75, 9.25], clamp);
  const stepped = Math.round(v * 20) / 20; // ticks of 0.05
  const done = frame >= at + 40;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 680 * s, opacity: out }}>
      <div
        style={{
          transform: `scale(${pop})`,
          background: C.surface,
          border: `${6 * s}px solid ${done ? C.accent : C.line}`,
          borderRadius: 26 * s,
          padding: `${20 * s}px ${44 * s}px`,
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 120 * s,
          color: done ? C.accent : C.ink,
          letterSpacing: "-0.02em",
          fontVariantNumeric: "tabular-nums",
          textAlign: "center",
          lineHeight: 1,
        }}
      >
        {stepped.toFixed(2)}
        <span style={{ fontSize: 54 * s, color: C.inkMuted, marginLeft: 14 * s }}>oz</span>
      </div>
    </AbsoluteFill>
  );
};

// ─── Ending: Maya's bag deflates too ──────────────────────────────────────

/** Maya's bag (left, held near her hip) that deflates on "Mine shrank too." */
export const MayasBag: React.FC<{ at: number; deflateAt: number }> = ({ at, deflateAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const g = useGround();
  if (frame < at) return null;
  const pop = spring({ frame: frame - at, fps, config: theme.motion.springSnappy });
  const puff = 1 - 0.42 * smooth(interpolate(frame, [deflateAt, deflateAt + 22], [0, 1], clamp));
  const wob = frame >= deflateAt ? Math.sin((frame - deflateAt) / 2) * 3 * (1 - Math.min(1, (frame - deflateAt) / 22)) : 0;
  return (
    <Layer>
      <g transform={`translate(520 ${g - 40}) scale(${0.62 * pop}) rotate(${-4 + wob})`}>
        <BagShape fill={0.5 * puff + 0.1} puff={puff} />
      </g>
    </Layer>
  );
};

// ─── Mechanism Moment graphic ─────────────────────────────────────────────

/**
 * Stage 1: the bag deflates like a balloon while its price tag stays put.
 * Stage 2: VersusCard-style old vs new ounces (rendered by the caller).
 * Stage 3: a shelf tag with the unit price circled in gold.
 * Frames are absolute.
 */
export const DeflatingBag: React.FC<{ delay: number; deflateAt: number; until: number }> = ({ delay, deflateAt, until }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { s } = useStage();
  const enter = spring({ frame: frame - delay, fps, config: theme.motion.spring });
  const out = interpolate(frame, [until - 8, until], [1, 0], clamp);
  if (frame >= until) return null;
  const d = smooth(interpolate(frame, [deflateAt, deflateAt + 44], [0, 1], clamp));
  const puff = 1 - 0.46 * d;
  const wob = Math.sin((frame - deflateAt) / 3) * 4 * (frame >= deflateAt && d < 1 ? 1 : 0);
  const W = 560;
  const H = 440;
  return (
    <div style={{ alignSelf: "center", opacity: enter * out, transform: `translateY(${(1 - enter) * 40 * s}px)` }}>
      <svg width={W * 0.9 * s} height={H * 0.9 * s} viewBox={`0 0 ${W} ${H}`}>
        <g transform={`translate(190 410) scale(1.05) rotate(${wob})`}>
          <BagShape fill={0.5 * puff + 0.1} puff={puff} />
        </g>
        {/* the price tag stays exactly where it is */}
        <g transform="translate(420 200) rotate(8)">
          <line x1={0} y1={-90} x2={0} y2={-50} stroke={C.line} strokeWidth={4} />
          <path d="M -80 -50 L 80 -50 L 80 60 L -80 60 Z" fill={C.surface} stroke={C.accent} strokeWidth={6} strokeLinejoin="round" />
          <circle cx={0} cy={-62} r={8} fill={C.bg} stroke={C.accent} strokeWidth={4} />
          <text x={0} y={4} textAnchor="middle" {...text(34)} fill={C.ink}>
            SAME
          </text>
          <text x={0} y={46} textAnchor="middle" {...text(34)} fill={C.accent}>
            PRICE
          </text>
        </g>
      </svg>
    </div>
  );
};

/**
 * A shelf tag: big price on the left, the tiny "price per ounce" in the corner gets circled in gold
 * (the circle draws itself). Generic tag, no store design.
 */
export const ShelfTag: React.FC<{ delay: number; circleAt: number }> = ({ delay, circleAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { s } = useStage();
  const enter = spring({ frame: frame - delay, fps, config: theme.motion.spring });
  const draw = interpolate(frame, [circleAt, circleAt + 18], [0, 1], clamp);
  const len = 520;
  const W = 640;
  const H = 300;
  return (
    <div style={{ alignSelf: "center", opacity: enter, transform: `translateY(${(1 - enter) * 40 * s}px)` }}>
      <svg width={W * 0.92 * s} height={H * 0.92 * s} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
        <rect x={10} y={20} width={620} height={260} rx={14} fill={C.surface} stroke={INK} strokeWidth={6} />
        <rect x={10} y={20} width={620} height={46} rx={14} fill={C.bgAlt} stroke={INK} strokeWidth={6} />
        <text x={34} y={54} {...text(26, 700)} fill={C.inkMuted} letterSpacing={4}>
          CHIPS · FAMILY SIZE
        </text>
        <text x={34} y={170} {...text(96)} fill={C.ink} letterSpacing={-1}>
          THE PRICE
        </text>
        {/* unit price: small print */}
        <text x={440} y={250} {...text(24, 700)} fill={C.accentLight} letterSpacing={2}>
          PRICE PER OZ
        </text>
        <ellipse
          cx={535}
          cy={242}
          rx={112}
          ry={34}
          fill="none"
          stroke={C.accent}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={len}
          strokeDashoffset={len * (1 - draw)}
          transform="rotate(-4 535 242)"
        />
      </svg>
    </div>
  );
};
