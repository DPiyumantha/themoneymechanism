/**
 * Set pieces and props for "Jake's Coffee Bank", flat vectors in the story kit's outlined
 * style. No real brand marks: the cups, app screen and gift card are deliberately generic.
 * Design px on a 1080-wide frame; `Layer` maps that onto the real frame.
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

/** A plain paper cup with a sleeve; no logo. (x, y) = bottom center. */
const Cup: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M -30 -96 L 30 -96 L 22 0 L -22 0 Z" fill={C.ink} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -27 -62 L 27 -62 L 24 -30 L -24 -30 Z" fill={C.accentDeep} stroke={INK} strokeWidth={4} />
    <rect x={-35} y={-112} width={70} height={18} rx={6} fill={C.inkMuted} stroke={INK} strokeWidth={5} />
  </g>
);

// ─── Coffee shop ───────────────────────────────────────────────────────────

const COUNTER = { left: 392, right: 688, height: 340 };

/** Pendant lights, the counter, an espresso machine and a stack of cups between the two characters. */
export const CoffeeShop: React.FC = () => {
  const frame = useCurrentFrame();
  const g = useGround();
  const top = g - COUNTER.height;
  const steam = (i: number) => interpolate((frame + i * 20) % 60, [0, 60], [0, 1]);
  return (
    <Layer>
      {/* pendant lights */}
      {[300, 540, 780].map((x, i) => (
        <g key={x} opacity={0.6}>
          <line x1={x} y1={0} x2={x} y2={250 + (i % 2) * 30} stroke={C.line} strokeWidth={4} />
          <path d={`M ${x - 46} ${290 + (i % 2) * 30} L ${x + 46} ${290 + (i % 2) * 30} L ${x + 20} ${250 + (i % 2) * 30} L ${x - 20} ${250 + (i % 2) * 30} Z`} fill={C.accentDeep} stroke={INK} strokeWidth={4} />
          <ellipse cx={x} cy={300 + (i % 2) * 30} rx={70} ry={18} fill={C.accentLight} opacity={0.25} />
        </g>
      ))}
      {/* counter */}
      <rect x={COUNTER.left} y={top + 22} width={COUNTER.right - COUNTER.left} height={COUNTER.height - 22} fill={C.surface} stroke={INK} strokeWidth={6} />
      <rect x={COUNTER.left - 14} y={top} width={COUNTER.right - COUNTER.left + 28} height={26} rx={6} fill={C.accentDeep} stroke={INK} strokeWidth={6} />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={COUNTER.left + 30 + i * 78} y1={top + 50} x2={COUNTER.left + 30 + i * 78} y2={g - 20} stroke={C.line} strokeWidth={4} />
      ))}
      {/* espresso machine */}
      <g transform={`translate(468 ${top})`}>
        <rect x={-62} y={-150} width={124} height={150} rx={10} fill={C.inkMuted} stroke={INK} strokeWidth={6} />
        <rect x={-62} y={-150} width={124} height={34} rx={8} fill={C.bgAlt} stroke={INK} strokeWidth={5} />
        <rect x={-18} y={-110} width={36} height={22} rx={4} fill={C.accent} stroke={INK} strokeWidth={4} />
        <circle cx={38} cy={-70} r={10} fill={C.accent} stroke={INK} strokeWidth={4} />
        <Cup x={0} y={-6} scale={0.55} />
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            d={`M ${-10 + i * 10} ${-80 - steam(i) * 60} q 8 -10 0 -20`}
            fill="none"
            stroke={C.ink}
            strokeWidth={3}
            opacity={0.5 * (1 - steam(i))}
            transform="translate(0 -40)"
          />
        ))}
      </g>
      {/* stack of cups */}
      <Cup x={620} y={top} />
      <Cup x={620} y={top - 20} />
      <Cup x={620} y={top - 40} />
    </Layer>
  );
};

/** Jake's phone screen, blown up next to him: "$50.00 added" with a gold check. Generic, no app design. */
export const ReloadScreen: React.FC<{ at: number; until: number }> = ({ at, until }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at || frame >= until) return null;
  const pop = spring({ frame: frame - at, fps, config: theme.motion.springSnappy });
  const out = interpolate(frame, [until - 8, until], [1, 0], clamp);
  const check = interpolate(frame, [at + 8, at + 18], [0, 1], clamp);
  const amount = Math.round(interpolate(frame, [at + 4, at + 16], [0, 50], clamp));
  return (
    <Layer>
      <g transform={`translate(540 880) scale(${0.78 * pop * out})`} opacity={out}>
        <rect x={-150} y={-250} width={300} height={500} rx={44} fill={C.bg} stroke={C.inkMuted} strokeWidth={8} />
        <rect x={-130} y={-226} width={260} height={452} rx={30} fill={C.surface} />
        <rect x={-40} y={-214} width={80} height={14} rx={7} fill={C.bg} />
        <circle cx={0} cy={-80} r={62} fill={C.accent} />
        <path d="M -30 -80 L -8 -56 L 34 -104" fill="none" stroke={C.onAccent} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={120} strokeDashoffset={120 * (1 - check)} />
        <text x={0} y={40} textAnchor="middle" {...text(64)} fill={C.ink}>
          ${amount}.00
        </text>
        <text x={0} y={92} textAnchor="middle" {...text(30, 600)} fill={C.inkMuted}>
          added
        </text>
        <rect x={-96} y={140} width={192} height={52} rx={26} fill={C.accent} />
        <text x={0} y={175} textAnchor="middle" {...text(24)} fill={C.onAccent} letterSpacing={2}>
          DONE
        </text>
      </g>
    </Layer>
  );
};

/** Quick original meme flash across the top: "POV: you reload $25 just in case". */
export const PovFlash: React.FC<{ at: number; duration?: number }> = ({ at, duration = 42 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { s } = useStage();
  if (frame < at || frame >= at + duration) return null;
  const pop = spring({ frame: frame - at, fps, config: theme.motion.springSnappy });
  const out = interpolate(frame, [at + duration - 6, at + duration], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: out }}>
      <div
        style={{
          transform: `rotate(-3deg) scale(${pop})`,
          background: C.ink,
          color: C.bg,
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 58 * s,
          padding: `${18 * s}px ${30 * s}px`,
          borderRadius: 18 * s,
          border: `${6 * s}px solid ${C.accent}`,
          textAlign: "center",
          lineHeight: 1.15,
        }}
      >
        POV: you reload <span style={{ color: C.accentDeep }}>$25</span>
        <br />
        just in case
      </div>
    </AbsoluteFill>
  );
};

/** One tiny Jake: hair, face, grey hoodie. Centered at (0,0), about 40×56. */
const MiniJake: React.FC<{ x: number; y: number; scale: number }> = ({ x, y, scale }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M -20 28 Q -20 6 0 6 Q 20 6 20 28 Z" fill={C.inkMuted} stroke={INK} strokeWidth={3} />
    <circle cx={0} cy={-8} r={13} fill={C.accentLight} stroke={INK} strokeWidth={3} />
    <path d="M -13 -12 Q -8 -26 4 -22 Q 14 -24 13 -12 Q 4 -16 -13 -12 Z" fill={C.accentDeep} stroke={INK} strokeWidth={2} />
  </g>
);

/** "Now multiply you by millions": a grid of tiny Jakes fills the frame from the center out. */
export const JakeGrid: React.FC<{ at: number; until: number }> = ({ at, until }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const { s } = useStage();
  if (frame < at || frame >= until) return null;
  const W = width / s;
  const H = height / s;
  const step = 62;
  const cols = Math.ceil(W / step) + 1;
  const rows = Math.ceil(H / step) + 1;
  const reach = interpolate(frame, [at, at + 30], [0, Math.hypot(W, H) / 2 + step], clamp);
  const fadeOut = interpolate(frame, [until - 8, until], [1, 0], clamp);
  const jakes: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * step + (r % 2) * (step / 2);
      const y = r * step;
      const d = Math.hypot(x - W / 2, y - H / 2);
      if (d > reach) continue;
      const grow = Math.min(1, (reach - d) / 80);
      jakes.push(<MiniJake key={`${r}-${c}`} x={x} y={y} scale={grow} />);
    }
  }
  return (
    <Layer style={{ opacity: fadeOut }}>
      <rect x={0} y={0} width={W} height={H} fill={C.bg} opacity={0.82 * Math.min(1, reach / 300)} />
      {jakes}
    </Layer>
  );
};

/** The crumpled gift card from 2019, pulled from Jake's wallet. Generic card, no logo. */
export const OldGiftCard: React.FC<{ at: number; x: number; y: number }> = ({ at, x, y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const p = spring({ frame: frame - at, fps, config: { damping: 14, stiffness: 120 } });
  return (
    <Layer>
      <g transform={`translate(${x} ${y - p * 120}) rotate(${-12 + p * 4}) scale(${0.4 + 0.6 * p})`}>
        {/* wallet */}
        <rect x={-70} y={40} width={140} height={90} rx={12} fill={C.bgAlt} stroke={INK} strokeWidth={5} opacity={1 - p} />
        {/* card, a bit crumpled */}
        <path d="M -95 -60 L -20 -66 L 40 -58 L 96 -62 L 92 4 L 98 58 L 20 62 L -40 56 L -96 62 L -90 0 Z" fill={C.accent} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d="M -20 -66 L -12 60 M 40 -58 L 30 62" stroke={C.accentDeep} strokeWidth={3} opacity={0.7} />
        <text x={0} y={18} textAnchor="middle" {...text(48)} fill={C.onAccent}>
          2019
        </text>
        <text x={-70} y={-30} {...text(18, 700)} fill={C.onAccent} letterSpacing={2}>
          GIFT CARD
        </text>
      </g>
    </Layer>
  );
};

// ─── Mechanism Moment graphic ─────────────────────────────────────────────

/**
 * A $50 bill floats out of a phone into a giant coffee-cup-shaped vault (dial on the front),
 * which locks with a turn. Frames are absolute.
 */
export const CupVault: React.FC<{ delay: number; billAt: number; lockAt: number }> = ({ delay, billAt, lockAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { s } = useStage();
  const enter = spring({ frame: frame - delay, fps, config: theme.motion.spring });
  const t = interpolate(frame, [billAt, billAt + 26], [0, 1], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
  const billX = interpolate(t, [0, 1], [110, 420]);
  const billY = interpolate(t, [0, 1], [230, 70]) - Math.sin(t * Math.PI) * 90;
  const billIn = t >= 1;
  const dial = interpolate(frame, [lockAt, lockAt + 14], [0, 270], clamp);
  const glow = interpolate(frame, [lockAt + 8, lockAt + 16, lockAt + 40], [0, 1, 0.4], clamp);
  const W = 640;
  const H = 360;
  return (
    <div style={{ alignSelf: "center", opacity: enter, transform: `translateY(${(1 - enter) * 40 * s}px)` }}>
      <svg width={W * 0.62 * s} height={H * 0.62 * s} viewBox={`0 0 ${W} ${H}`}>
        {/* phone */}
        <g transform="translate(110 250)">
          <rect x={-52} y={-90} width={104} height={180} rx={18} fill={C.bg} stroke={C.inkMuted} strokeWidth={5} />
          <rect x={-42} y={-76} width={84} height={152} rx={10} fill={C.surface} />
        </g>
        {/* the vault: a giant paper cup with a lid and a vault dial */}
        <g transform="translate(430 340)">
          <ellipse cx={0} cy={-150} rx={170} ry={150} fill={C.accent} opacity={0.18 * glow} />
          <path d="M -120 -250 L 120 -250 L 92 0 L -92 0 Z" fill={C.surface} stroke={C.accent} strokeWidth={6} strokeLinejoin="round" />
          <rect x={-134} y={-280} width={268} height={36} rx={12} fill={C.inkMuted} stroke={INK} strokeWidth={5} />
          <path d="M -112 -170 L 112 -170 L 104 -96 L -104 -96 Z" fill={C.accentDeep} stroke={INK} strokeWidth={4} />
          <g transform={`translate(0 -133) rotate(${dial})`}>
            <circle r={30} fill={C.accent} stroke={INK} strokeWidth={5} />
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <line key={a} x1={0} y1={-30} x2={0} y2={-40} stroke={C.accentLight} strokeWidth={5} transform={`rotate(${a})`} />
            ))}
            <line x1={0} y1={0} x2={0} y2={-22} stroke={INK} strokeWidth={6} strokeLinecap="round" />
          </g>
          {/* slot in the lid */}
          <rect x={-50} y={-268} width={100} height={12} rx={6} fill={C.bg} />
        </g>
        {/* the $50 bill */}
        {frame >= billAt && !billIn ? (
          <g transform={`translate(${billX} ${billY}) rotate(${interpolate(t, [0, 1], [-10, 0])}) scale(${interpolate(t, [0.8, 1], [1, 0.5], clamp)})`}>
            <rect x={-70} y={-34} width={140} height={68} rx={8} fill={C.positive} stroke={INK} strokeWidth={5} />
            <circle r={20} fill="none" stroke={INK} strokeWidth={4} />
            <text x={0} y={9} textAnchor="middle" {...text(24)} fill={INK}>
              50
            </text>
          </g>
        ) : null}
      </svg>
    </div>
  );
};
