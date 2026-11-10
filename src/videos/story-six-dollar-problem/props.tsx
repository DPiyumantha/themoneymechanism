/**
 * Set pieces and props for "The $6 Problem", flat vectors in the story kit's outlined style.
 * No real brand marks: the laptop, cart and slicer are deliberately generic.
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

// ─── Living room ───────────────────────────────────────────────────────────

/** A couch behind the characters, a lamp, a window and a glowing laptop on a cushion between them. */
export const LivingRoom: React.FC = () => {
  const frame = useCurrentFrame();
  const g = useGround();
  const flicker = 0.9 + Math.sin(frame / 23) * 0.05;
  const top = g - 330;
  return (
    <Layer>
      {/* night window */}
      <rect x={90} y={g - 980} width={240} height={330} rx={10} fill={C.bgAlt} stroke={INK} strokeWidth={6} />
      <line x1={210} y1={g - 980} x2={210} y2={g - 650} stroke={INK} strokeWidth={5} />
      <line x1={90} y1={g - 815} x2={330} y2={g - 815} stroke={INK} strokeWidth={5} />
      {[
        [140, 880],
        [260, 760],
        [280, 930],
        [160, 790],
      ].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={g - y} r={4} fill={C.inkMuted} opacity={0.6} />
      ))}
      {/* lamp */}
      <g transform={`translate(930 ${g})`}>
        <ellipse cx={0} cy={-520} rx={190} ry={230} fill={C.accent} opacity={0.12 * flicker} />
        <rect x={-6} y={-470} width={12} height={440} fill={C.inkMuted} stroke={INK} strokeWidth={4} />
        <ellipse cx={0} cy={-26} rx={46} ry={12} fill={C.inkMuted} stroke={INK} strokeWidth={4} />
        <path d="M -52 -470 L 52 -470 L 30 -560 L -30 -560 Z" fill={C.accentLight} stroke={INK} strokeWidth={5} strokeLinejoin="round" opacity={flicker} />
      </g>
      {/* couch */}
      <path
        d={`M 150 ${top + 40} Q 150 ${top - 70} 260 ${top - 70} L 820 ${top - 70} Q 930 ${top - 70} 930 ${top + 40} L 930 ${g - 20} L 150 ${g - 20} Z`}
        fill={C.surface}
        stroke={INK}
        strokeWidth={6}
        strokeLinejoin="round"
      />
      <rect x={110} y={top + 30} width={80} height={290} rx={28} fill={C.bgAlt} stroke={INK} strokeWidth={6} />
      <rect x={890} y={top + 30} width={80} height={290} rx={28} fill={C.bgAlt} stroke={INK} strokeWidth={6} />
      <line x1={540} y1={top + 110} x2={540} y2={g - 30} stroke={INK} strokeWidth={5} />
      {/* laptop glowing on the middle cushion */}
      <g transform={`translate(540 ${top + 210})`}>
        <ellipse cx={0} cy={-60} rx={170} ry={120} fill={C.accent} opacity={0.14 * flicker} />
        <path d="M -62 -92 L 62 -92 L 70 -18 L -70 -18 Z" fill={C.accentLight} stroke={INK} strokeWidth={5} strokeLinejoin="round" opacity={0.9} />
        <path d="M -84 -14 L 84 -14 L 96 6 L -96 6 Z" fill={C.inkMuted} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      </g>
    </Layer>
  );
};

// ─── Cart total (laptop screen blown up) ───────────────────────────────────

const CONFETTI = Array.from({ length: 26 }, (_, i) => ({
  x: ((i * 97) % 100) / 100 - 0.5,
  vy: 7 + ((i * 53) % 9),
  rot: (i * 47) % 360,
  hue: i % 3,
}));

/**
 * Jake's cart: the total ticks from $29.00 to $41.00 like an odometer while a bar climbs past the
 * gold $35 line. At the crossing a "FREE SHIPPING UNLOCKED" banner fires confetti, then a gold "-$6"
 * stamp is crossed out and replaced with "+$12". All frames are absolute.
 */
export const CartPanel: React.FC<{
  at: number;
  rampFrom: number;
  rampTo: number;
  stampAt: number;
  until: number;
  x?: number;
  y?: number;
}> = ({ at, rampFrom, rampTo, stampAt, until, x = 540, y = 950 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at || frame >= until) return null;
  const pop = spring({ frame: frame - at, fps, config: theme.motion.springSnappy });
  const out = interpolate(frame, [until - 8, until], [1, 0], clamp);
  const t = smooth(interpolate(frame, [rampFrom, rampTo], [0, 1], clamp));
  const total = 29 + 12 * t;
  const whole = Math.floor(total);
  const cents = Math.floor((total - whole) * 100);
  const unlocked = total >= 35;
  // First frame the total reaches $35 (t = 6/12 = 0.5 on the smoothstep curve = the midpoint).
  const bannerAt = Math.round((rampFrom + rampTo) / 2);
  const bannerP = frame >= bannerAt ? spring({ frame: frame - bannerAt, fps, config: theme.motion.springSnappy }) : 0;
  const barFrac = interpolate(total, [20, 45], [0, 1], clamp);
  const lineFrac = interpolate(35, [20, 45], [0, 1]);
  const BAR = { x: -120, w: 240 };
  const stamp = frame >= stampAt ? spring({ frame: frame - stampAt, fps, config: { damping: 11, stiffness: 160 } }) : 0;
  const cross = interpolate(frame, [stampAt + 18, stampAt + 26], [0, 1], clamp);
  const plus = frame >= stampAt + 30 ? spring({ frame: frame - (stampAt + 30), fps, config: { damping: 12, stiffness: 170 } }) : 0;
  const tick = frame > rampFrom && frame < rampTo ? Math.sin((frame - rampFrom) * 1.4) * 2.5 : 0;
  return (
    <Layer>
      <g transform={`translate(${x} ${y}) scale(${0.9 * pop * out})`} opacity={out}>
        <rect x={-190} y={-250} width={380} height={470} rx={34} fill={C.bg} stroke={C.inkMuted} strokeWidth={8} />
        <rect x={-170} y={-228} width={340} height={426} rx={22} fill={C.surface} />
        <text x={-140} y={-185} {...text(26, 700)} fill={C.inkMuted} letterSpacing={4}>
          CART
        </text>
        {/* odometer total */}
        <g transform={`translate(0 ${-70 + tick})`}>
          <text x={0} y={0} textAnchor="middle" {...text(100)} fill={unlocked ? C.accentLight : C.ink}>
            ${whole}
            <tspan {...text(54)} fill={C.inkMuted}>
              .{String(cents).padStart(2, "0")}
            </tspan>
          </text>
        </g>
        {/* progress bar with the glowing $35 line */}
        <rect x={BAR.x} y={0} width={BAR.w} height={22} rx={11} fill={C.bgAlt} stroke={INK} strokeWidth={3} />
        <rect x={BAR.x} y={0} width={Math.max(1, BAR.w * barFrac)} height={22} rx={11} fill={C.accent} />
        <g transform={`translate(${BAR.x + BAR.w * lineFrac} 0)`}>
          <rect x={-12} y={-18} width={24} height={58} rx={12} fill={C.accentLight} opacity={0.28} />
          <rect x={-3} y={-14} width={6} height={50} rx={3} fill={C.accentLight} />
          <text x={0} y={64} textAnchor="middle" {...text(28)} fill={C.accentLight}>
            $35
          </text>
        </g>
        <text x={BAR.x} y={104} {...text(22, 600)} fill={C.inkMuted}>
          + $6 shipping
        </text>
        {/* banner */}
        <g transform={`translate(0 160) scale(${bannerP})`} opacity={bannerP}>
          <rect x={-160} y={-28} width={320} height={56} rx={28} fill={C.accent} />
          <text x={0} y={7} textAnchor="middle" {...text(19)} fill={C.onAccent} letterSpacing={0.5}>
            FREE SHIPPING UNLOCKED
          </text>
        </g>
        {/* confetti */}
        {CONFETTI.map((c, i) => {
          const f = frame - bannerAt;
          if (f < 0 || f > 40) return null;
          const px = c.x * 520 * Math.min(1, f / 14);
          const py = 140 - f * c.vy * 0.9 + f * f * 0.5;
          return (
            <rect
              key={i}
              x={px - 6}
              y={py - 6}
              width={12}
              height={12}
              rx={2}
              fill={[C.accent, C.accentLight, C.ink][c.hue]}
              opacity={1 - f / 40}
              transform={`rotate(${c.rot + f * 14} ${px} ${py})`}
            />
          );
        })}
      </g>
      {/* the stamp: "-$6" crossed out, "+$12" slammed on */}
      {stamp > 0 && (
        <g transform={`translate(${x + 120} ${y - 250}) rotate(-8)`} opacity={out}>
          <g transform={`scale(${0.5 + 0.5 * stamp})`} opacity={Math.min(1, stamp)}>
            <rect x={-92} y={-44} width={184} height={88} rx={14} fill={C.bg} stroke={C.accent} strokeWidth={7} />
            <text x={0} y={22} textAnchor="middle" {...text(66)} fill={C.accent}>
              −$6
            </text>
            <line x1={-96} y1={30} x2={-96 + 192 * cross} y2={30 - 60 * cross} stroke={C.negative} strokeWidth={9} strokeLinecap="round" />
          </g>
          {plus > 0 && (
            <g transform={`translate(30 78) scale(${plus})`} opacity={Math.min(1, plus)}>
              <rect x={-100} y={-44} width={200} height={88} rx={14} fill={C.negative} stroke={INK} strokeWidth={6} />
              <text x={0} y={22} textAnchor="middle" {...text(66)} fill={C.ink}>
                +$12
              </text>
            </g>
          )}
        </g>
      )}
    </Layer>
  );
};

// ─── Gus + calculator (meme beat) ──────────────────────────────────────────

/** A chunky generic calculator. (x, y) = bottom center. */
export const Calculator: React.FC<{ x: number; y: number; at: number; until: number }> = ({ x, y, at, until }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at || frame >= until) return null;
  const p = spring({ frame: frame - at, fps, config: theme.motion.springSnappy });
  const out = interpolate(frame, [until - 6, until], [1, 0], clamp);
  const press = Math.floor((frame - at) / 5) % 9;
  return (
    <Layer style={{ opacity: out }}>
      <g transform={`translate(${x} ${y}) scale(${p})`}>
        <rect x={-62} y={-150} width={124} height={150} rx={14} fill={C.inkMuted} stroke={INK} strokeWidth={6} />
        <rect x={-48} y={-136} width={96} height={34} rx={6} fill={C.bg} stroke={INK} strokeWidth={3} />
        <text x={42} y={-110} textAnchor="end" {...text(24)} fill={C.positive}>
          {frame % 20 < 10 ? "12−6" : "= 6"}
        </text>
        {Array.from({ length: 9 }, (_, i) => (
          <rect
            key={i}
            x={-46 + (i % 3) * 32}
            y={-88 + Math.floor(i / 3) * 28}
            width={26}
            height={22}
            rx={5}
            fill={i === press ? C.accentLight : C.accent}
            stroke={INK}
            strokeWidth={3}
          />
        ))}
      </g>
    </Layer>
  );
};

// ─── Ending props: avocado slicer and avocado ──────────────────────────────

/** A generic avocado slicer (handle plus a wire-and-blade head). (x, y) = handle bottom, tilted. */
const Slicer: React.FC<{ x: number; y: number; rot: number; scale: number }> = ({ x, y, rot, scale }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
    <rect x={-14} y={-60} width={28} height={80} rx={12} fill={C.positive} stroke={INK} strokeWidth={5} />
    <path d="M -50 -60 L 50 -60 L 50 -150 Q 0 -190 -50 -150 Z" fill={C.accentLight} stroke={INK} strokeWidth={5} strokeLinejoin="round" opacity={0.9} />
    {[-30, -10, 10, 30].map((lx) => (
      <line key={lx} x1={lx} y1={-62} x2={lx} y2={-150} stroke={INK} strokeWidth={3} />
    ))}
  </g>
);

const Avocado: React.FC<{ x: number; y: number; rot: number; scale: number }> = ({ x, y, rot, scale }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
    <path d="M 0 -110 Q 24 -112 36 -70 Q 66 -10 34 22 Q 0 44 -34 22 Q -66 -10 -36 -70 Q -24 -112 0 -110 Z" fill={C.positive} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 0 -80 Q 16 -80 24 -50 Q 44 -6 22 12 Q 0 26 -22 12 Q -44 -6 -24 -50 Q -16 -80 0 -80 Z" fill={C.accentLight} opacity={0.55} />
    <circle cx={0} cy={-6} r={16} fill={C.accentDeep} stroke={INK} strokeWidth={4} />
  </g>
);

/**
 * Ending: Jake proudly holds up the slicer (his side, x ~ 780); Maya's avocado floats across to him.
 * `slicerAt` raises the slicer, `avocadoAt` starts the hand-over.
 */
export const EndProps: React.FC<{ slicerAt: number; avocadoAt: number }> = ({ slicerAt, avocadoAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const g = useGround();
  const sp = frame >= slicerAt ? spring({ frame: frame - slicerAt, fps, config: { damping: 12, stiffness: 150 } }) : 0;
  const t = smooth(interpolate(frame, [avocadoAt, avocadoAt + 26], [0, 1], clamp));
  const show = frame >= avocadoAt;
  const wobble = frame >= avocadoAt + 40 ? Math.sin((frame - avocadoAt) / 5) * 6 : 0;
  return (
    <Layer>
      {sp > 0 && <Slicer x={880} y={g - 520 - sp * 80} rot={14 + wobble} scale={0.9 * sp} />}
      {show && <Avocado x={interpolate(t, [0, 1], [470, 690])} y={g - 330 - Math.sin(t * Math.PI) * 60} rot={-12 + t * 40} scale={0.85} />}
    </Layer>
  );
};

// ─── Mechanism Moment graphic ──────────────────────────────────────────────

/** The same threshold as a compact bar: a glowing gold $35 line, the cart climbing past it. */
export const ThresholdBar: React.FC<{ delay: number; climbAt: number }> = ({ delay, climbAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { s } = useStage();
  const enter = spring({ frame: frame - delay, fps, config: theme.motion.spring });
  const t = smooth(interpolate(frame, [climbAt, climbAt + 36], [0, 1], clamp));
  const total = 29 + 12 * t;
  const pass = total >= 35;
  const glow = 0.5 + 0.5 * Math.sin(frame / 5);
  const W = 760;
  const px = (v: number) => interpolate(v, [20, 45], [0, W]);
  return (
    <div style={{ alignSelf: "center", opacity: enter, transform: `translateY(${(1 - enter) * 40 * s}px)` }}>
      <svg width={W * 0.9 * s} height={170 * 0.9 * s} viewBox={`-20 0 ${W + 40} 170`}>
        <text x={0} y={52} {...text(56)} fill={pass ? C.accentLight : C.ink}>
          Cart ${total.toFixed(2)}
        </text>
        <rect x={0} y={84} width={W} height={32} rx={16} fill={C.bgAlt} stroke={C.line} strokeWidth={3} />
        <rect x={0} y={84} width={Math.max(2, px(total))} height={32} rx={16} fill={C.accent} />
        <g transform={`translate(${px(35)} 0)`}>
          <rect x={-20} y={68} width={40} height={64} rx={20} fill={C.accentLight} opacity={0.2 + 0.25 * glow} />
          <rect x={-4} y={70} width={8} height={60} rx={4} fill={C.accentLight} />
          <text x={0} y={162} textAnchor="middle" {...text(30)} fill={C.accentLight}>
            $35 line
          </text>
        </g>
      </svg>
    </div>
  );
};
