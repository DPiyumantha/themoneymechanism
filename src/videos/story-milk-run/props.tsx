/**
 * Set pieces and props for "The Milk Run", drawn as flat vectors in the story kit's
 * outlined style (same ink outline as the characters). Everything works in design px
 * on a 1080-wide frame; `Layer` maps that onto the real frame.
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

/** Ground line in design px. */
const useGround = () => {
  const { groundY, s } = useStage();
  return groundY / s;
};

// ─── Kitchen ────────────────────────────────────────────────────────────────

const COUNTER = { left: 392, right: 688, height: 340 };

/** Night window with city lights, and the kitchen counter between the two characters. */
export const Kitchen: React.FC = () => {
  const g = useGround();
  const top = g - COUNTER.height;
  const lights = Array.from({ length: 22 }, (_, i) => ({
    x: 402 + ((i * 53) % 270),
    y: 312 + ((i * 37) % 150),
    h: 10 + ((i * 7) % 14),
  }));
  return (
    <Layer>
      {/* window */}
      <g opacity={0.55}>
        <rect x={380} y={286} width={320} height={210} rx={10} fill={C.bgAlt} stroke={C.line} strokeWidth={4} />
        {lights.map((l, i) => (
          <rect key={i} x={l.x} y={l.y + 210 - l.h * 4} width={10} height={l.h} fill={C.accent} opacity={0.35 + (i % 3) * 0.2} />
        ))}
        <line x1={540} y1={286} x2={540} y2={496} stroke={C.line} strokeWidth={4} />
      </g>
      {/* counter */}
      <rect x={COUNTER.left} y={top + 22} width={COUNTER.right - COUNTER.left} height={COUNTER.height - 22} fill={C.surface} stroke={INK} strokeWidth={6} />
      <rect x={COUNTER.left - 14} y={top} width={COUNTER.right - COUNTER.left + 28} height={26} rx={6} fill={C.inkMuted} stroke={INK} strokeWidth={6} />
      <rect x={COUNTER.left + 22} y={top + 60} width={112} height={COUNTER.height - 96} rx={6} fill="none" stroke={C.line} strokeWidth={4} />
      <rect x={COUNTER.right - 134} y={top + 60} width={112} height={COUNTER.height - 96} rx={6} fill="none" stroke={C.line} strokeWidth={4} />
      <circle cx={COUNTER.left + 122} cy={top + 150} r={6} fill={C.accent} />
      <circle cx={COUNTER.right - 122} cy={top + 150} r={6} fill={C.accent} />
    </Layer>
  );
};

const BAG = { w: 84, h: 100 };

const Bag: React.FC<{ x: number; y: number; peek?: "bread" | "chips" | "none"; tilt?: number; squash?: number }> = ({
  x,
  y,
  peek = "none",
  tilt = 0,
  squash = 1,
}) => (
  // (x, y) = bottom center
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${1 / squash} ${squash})`}>
    {peek === "bread" ? (
      <rect x={-12} y={-BAG.h - 46} width={26} height={70} rx={13} fill={C.accentLight} stroke={INK} strokeWidth={5} transform="rotate(12)" />
    ) : null}
    {peek === "chips" ? (
      <path d={`M ${-30} ${-BAG.h + 10} L ${-24} ${-BAG.h - 34} L 4 ${-BAG.h - 30} L 2 ${-BAG.h + 10} Z`} fill={C.accent} stroke={INK} strokeWidth={5} />
    ) : null}
    <path
      d={`M ${-BAG.w / 2} ${-BAG.h} L ${BAG.w / 2} ${-BAG.h} L ${BAG.w / 2 + 6} 0 L ${-BAG.w / 2 - 6} 0 Z`}
      fill={C.accentDeep}
      stroke={INK}
      strokeWidth={6}
      strokeLinejoin="round"
    />
    <rect x={-BAG.w / 2} y={-BAG.h} width={BAG.w} height={16} fill={C.accent} stroke={INK} strokeWidth={5} />
    <path d={`M -18 ${-BAG.h} Q 0 ${-BAG.h - 30} 18 ${-BAG.h}`} fill="none" stroke={INK} strokeWidth={5} />
  </g>
);

/** Where the six bags are while Jake holds them, and where they land on the counter. */
const HOLD: [number, number][] = [
  [668, 1032], [690, 1052], [712, 1072],
  [868, 1032], [890, 1052], [912, 1072],
];
const slotsOn = (top: number): [number, number][] => [
  [470, top], [540, top], [610, top],
  [505, top - 84], [575, top - 84],
  [540, top - 168],
];
const PEEK: ("bread" | "chips" | "none")[] = ["none", "chips", "none", "bread", "none", "chips"];

/** Frame each bag lands on the counter (absolute). Used for the thud SFX too. */
export const bagLandFrames = (from: number, every = 9) => HOLD.map((_, i) => from + i * every + 12);

/**
 * Jake's six grocery bags: held at his sides, then they hop onto the counter one by one.
 * `from` = first bag leaves his hands (absolute frame).
 */
export const Bags: React.FC<{ from: number; every?: number }> = ({ from, every = 9 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const g = useGround();
  const holdOffset = Math.sin(frame * 0.09) * 4;
  const slots = slotsOn(g - COUNTER.height);
  return (
    <Layer>
      {HOLD.map(([hx, hy], i) => {
        const start = from + i * every;
        const p = spring({ frame: frame - start, fps, config: { damping: 200, stiffness: 150 }, durationInFrames: 12 });
        const [sx, sy] = slots[i];
        const x = interpolate(p, [0, 1], [hx, sx]);
        const y = interpolate(p, [0, 1], [hy + holdOffset, sy]) - Math.sin(p * Math.PI) * 120;
        const land = frame - (start + 12);
        const squash = land >= 0 && land < 6 ? 1 - 0.1 * Math.sin((land / 6) * Math.PI) : 1;
        return <Bag key={i} x={x} y={y} peek={PEEK[i]} tilt={interpolate(p, [0, 1], [i < 3 ? -6 : 6, 0])} squash={squash} />;
      })}
    </Layer>
  );
};

/** The receipt gag: a long receipt unrolls from the bags, over the counter, onto the floor. */
export const Receipt: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const g = useGround();
  const top = g - COUNTER.height - 40;
  const drop = g - top + 4;
  const down = interpolate(frame, [at, at + 20], [0, drop], { ...clamp, easing: (t) => 1 - (1 - t) ** 2 });
  const along = interpolate(frame, [at + 18, at + 34], [0, 150], clamp);
  if (frame < at) return null;
  const x = 516;
  const w = 48;
  const lines = Array.from({ length: Math.floor((down + along) / 26) }, (_, i) => i);
  return (
    <Layer>
      <rect x={x} y={top} width={w} height={down} fill={C.ink} stroke={INK} strokeWidth={4} />
      {along > 0 ? <rect x={x} y={g - w * 0.5} width={w + along} height={w * 0.5} fill={C.ink} stroke={INK} strokeWidth={4} /> : null}
      {lines.map((i) => {
        const d = i * 26 + 18;
        return d < down ? (
          <line key={i} x1={x + 9} x2={x + w - (i % 3 === 0 ? 20 : 9)} y1={top + d} y2={top + d} stroke={C.inkMuted} strokeWidth={4} />
        ) : (
          <line key={i} x1={x + d - down + 8} x2={x + d - down + 8} y1={g - w * 0.5 + 6} y2={g - 6} stroke={C.inkMuted} strokeWidth={4} />
        );
      })}
    </Layer>
  );
};

/** Jake's keys, in his hand while he heads out. */
export const Keys: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const frame = useCurrentFrame();
  const swing = Math.sin(frame * 0.4) * 10;
  return (
    <Layer>
      <g transform={`translate(${x} ${y}) rotate(${swing})`}>
        <circle r={16} fill="none" stroke={C.accent} strokeWidth={6} />
        <rect x={-5} y={14} width={10} height={36} rx={3} fill={C.accentLight} stroke={INK} strokeWidth={3} />
        <rect x={5} y={36} width={10} height={6} fill={C.accentLight} />
      </g>
    </Layer>
  );
};

// ─── Grocery aisle ─────────────────────────────────────────────────────────

/** Vanishing point and back wall of the aisle (design px). */
export const AISLE = { vpx: 540, back: { left: 450, right: 630, top: 560, bottom: 760 } };

/** Floor y at depth d (0 = front, 1 = back wall). */
export const floorAt = (ground: number, d: number) => interpolate(d, [0, 1], [ground, AISLE.back.bottom]);

/**
 * One-point-perspective supermarket aisle: unbranded boxes on both sides, a glowing
 * dairy cooler at the far end. `eyeLevelAt` sweeps a gold line across the shelves at
 * eye level and lights up the boxes on that shelf.
 */
export const Aisle: React.FC<{ eyeLevelAt?: number }> = ({ eyeLevelAt }) => {
  const frame = useCurrentFrame();
  const g = useGround();
  const { width, height } = useVideoConfig();
  const { s } = useStage();
  const H = height / s;
  const W = width / s;
  const b = AISLE.back;
  const ROWS = 6;
  const shelfTop = 140;
  // Depth with foreshortening: u in [0,1] → share of the way to the back wall.
  const depth = (u: number) => 1 - 1 / (1 + 4 * u);
  const norm = depth(1);
  const shelfY = (row: number, side: "front" | "back") => {
    const t = row / ROWS;
    return side === "front" ? interpolate(t, [0, 1], [shelfTop, g - 40]) : interpolate(t, [0, 1], [b.top, b.bottom]);
  };
  const eyeRow = 3; // shelf at eye level (head height of the characters)
  const sweep = eyeLevelAt === undefined ? 0 : interpolate(frame, [eyeLevelAt, eyeLevelAt + 18], [0, 1], clamp);
  const glowOn = eyeLevelAt !== undefined && frame >= eyeLevelAt;
  const coolerPulse = 0.75 + 0.25 * Math.sin(frame * 0.12);

  const shelves = (side: "left" | "right") => {
    const xf = side === "left" ? 0 : W;
    const xb = side === "left" ? b.left : b.right;
    const boxes: React.ReactNode[] = [];
    for (let r = 0; r < ROWS; r++) {
      const COLS = 7;
      for (let c = 0; c < COLS; c++) {
        const d0 = depth(c / COLS) / norm;
        const d1 = depth((c + 0.82) / COLS) / norm;
        const x0 = interpolate(d0, [0, 1], [xf, xb]);
        const x1 = interpolate(d1, [0, 1], [xf, xb]);
        const yTop = (d: number) => interpolate(d, [0, 1], [shelfY(r, "front"), shelfY(r, "back")]);
        const yBot = (d: number) => interpolate(d, [0, 1], [shelfY(r + 1, "front"), shelfY(r + 1, "back")]);
        const inset = (d: number) => (yBot(d) - yTop(d)) * 0.18;
        const lit = glowOn && r === eyeRow && d0 <= sweep;
        const fill = lit ? C.accent : (r + c) % 3 === 0 ? C.surface : (r + c) % 3 === 1 ? C.bgAlt : C.bg;
        boxes.push(
          <path
            key={`${side}-${r}-${c}`}
            d={`M ${x0} ${yTop(d0) + inset(d0)} L ${x1} ${yTop(d1) + inset(d1)} L ${x1} ${yBot(d1) - 2} L ${x0} ${yBot(d0) - 2} Z`}
            fill={fill}
            stroke={lit ? C.accentLight : INK}
            strokeWidth={3}
            opacity={lit ? 1 : 0.95}
          />,
        );
      }
      // shelf edge
      boxes.push(
        <line key={`${side}-edge-${r}`} x1={xf} y1={shelfY(r + 1, "front")} x2={xb} y2={shelfY(r + 1, "back")} stroke={C.line} strokeWidth={5} />,
      );
    }
    return boxes;
  };

  return (
    <Layer>
      {/* ceiling and floor */}
      <path d={`M 0 0 L ${W} 0 L ${b.right} ${b.top} L ${b.left} ${b.top} Z`} fill={C.bg} />
      <path d={`M 0 ${g} L ${W} ${g} L ${W} ${H} L 0 ${H} Z`} fill={C.bg} />
      <path d={`M 0 ${g} L ${W} ${g} L ${b.right} ${b.bottom} L ${b.left} ${b.bottom} Z`} fill={C.bgAlt} />
      {[0.25, 0.5, 0.75].map((t) => (
        <line key={t} x1={interpolate(t, [0, 1], [0, W])} y1={g} x2={interpolate(t, [0, 1], [b.left, b.right])} y2={b.bottom} stroke={C.line} strokeWidth={2} opacity={0.5} />
      ))}
      {/* ceiling lights */}
      {[0.1, 0.35, 0.6, 0.8].map((u) => {
        const d = depth(u) / norm;
        const y = interpolate(d, [0, 1], [40, b.top - 10]);
        const w = interpolate(d, [0, 1], [260, 50]);
        return <rect key={u} x={540 - w / 2} y={y} width={w} height={interpolate(d, [0, 1], [14, 4])} rx={4} fill={C.accentLight} opacity={0.35} />;
      })}
      {/* dairy cooler at the back */}
      <rect x={b.left - 30} y={b.top - 30} width={b.right - b.left + 60} height={b.bottom - b.top + 60} fill={C.accent} opacity={0.18 * coolerPulse} rx={12} />
      <rect x={b.left} y={b.top} width={b.right - b.left} height={b.bottom - b.top} fill={C.surface} stroke={C.accentLight} strokeWidth={4} />
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={b.left + 10 + i * ((b.right - b.left - 20) / 3)}
          y={b.top + 10}
          width={(b.right - b.left - 20) / 3 - 8}
          height={b.bottom - b.top - 20}
          fill={C.accentLight}
          opacity={0.45 * coolerPulse}
        />
      ))}
      {shelves("left")}
      {shelves("right")}
      {/* eye-level sweep */}
      {glowOn ? (
        <g opacity={interpolate(frame, [eyeLevelAt! + 30, eyeLevelAt! + 50], [1, 0.6], clamp)}>
          <line
            x1={0}
            x2={W * sweep}
            y1={shelfY(eyeRow, "front") + 50}
            y2={shelfY(eyeRow, "front") + 50}
            stroke={C.accentLight}
            strokeWidth={8}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 14px ${C.accent})` }}
          />
          <g opacity={interpolate(frame, [eyeLevelAt! + 10, eyeLevelAt! + 18], [0, 1], clamp)}>
            <rect x={14} y={shelfY(eyeRow, "front") + 92} width={164} height={38} rx={19} fill={C.bg} stroke={C.accentLight} strokeWidth={3} />
            <text
              x={96}
              y={shelfY(eyeRow, "front") + 118}
              textAnchor="middle"
              fontFamily={theme.fonts.body}
              fontWeight={800}
              fontSize={20}
              letterSpacing={2}
              fill={C.accentLight}
            >
              EYE LEVEL
            </text>
          </g>
        </g>
      ) : null}
    </Layer>
  );
};

/** The bag of chips in Jake's hand in the aisle. */
export const ChipsBag: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const frame = useCurrentFrame();
  const wobble = Math.sin(frame * 0.25) * 4;
  return (
    <Layer>
      <g transform={`translate(${x} ${y}) rotate(${wobble})`}>
        <path d="M -46 -70 L 46 -70 L 40 70 L -40 70 Z" fill={C.accent} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d="M -46 -70 L -36 -84 L -24 -70 L -12 -84 L 0 -70 L 12 -84 L 24 -70 L 36 -84 L 46 -70" fill="none" stroke={INK} strokeWidth={5} />
        <circle cx={0} cy={4} r={24} fill={C.accentLight} stroke={INK} strokeWidth={5} />
      </g>
    </Layer>
  );
};

// ─── Mechanism Moment graphic ─────────────────────────────────────────────

/**
 * Top-down store map: entrance at the bottom, dairy cooler along the back wall,
 * a dotted path from the door to the cooler and impulse displays lighting up gold
 * as the path passes them. Frames are absolute.
 */
export const StoreMap: React.FC<{ delay: number; coolerAt: number; pathFrom: number; pathTo: number }> = ({
  delay,
  coolerAt,
  pathFrom,
  pathTo,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { s } = useStage();
  const enter = spring({ frame: frame - delay, fps, config: theme.motion.spring });
  const W = 640;
  const H = 520;
  // aisles: 4 vertical shelf blocks
  const aisles = [0, 1, 2, 3].map((i) => ({ x: 92 + i * 128, y: 130, w: 70, h: 290 }));
  // route from the door (bottom center) zig-zagging up the aisles to the cooler
  const route: [number, number][] = [
    [320, 500], [320, 455], [60, 455], [60, 120], [190, 120], [190, 440], [318, 440], [318, 120], [446, 120], [446, 440], [580, 440], [580, 92],
  ];
  const segLen = route.slice(1).map((p, i) => Math.hypot(p[0] - route[i][0], p[1] - route[i][1]));
  const total = segLen.reduce((a, b) => a + b, 0);
  const progress = interpolate(frame, [pathFrom, pathTo], [0, 1], clamp);
  const pointAt = (dist: number): [number, number] => {
    let d = dist;
    for (let i = 0; i < segLen.length; i++) {
      if (d <= segLen[i]) {
        const t = d / segLen[i];
        return [route[i][0] + (route[i + 1][0] - route[i][0]) * t, route[i][1] + (route[i + 1][1] - route[i][1]) * t];
      }
      d -= segLen[i];
    }
    return route[route.length - 1];
  };
  const STEP = 22;
  const dots = Array.from({ length: Math.floor(total / STEP) + 1 }, (_, i) => i * STEP).filter((d) => d <= total * progress);
  // impulse displays along the route, with the distance at which the path reaches each
  const items = [
    { x: 60, y: 300 }, { x: 190, y: 200 }, { x: 190, y: 380 }, { x: 318, y: 260 }, { x: 446, y: 180 }, { x: 446, y: 360 }, { x: 580, y: 300 },
  ].map((it) => {
    let best = 0;
    let bestD = Infinity;
    for (let d = 0; d <= total; d += 4) {
      const [px, py] = pointAt(d);
      const dd = Math.hypot(px - it.x, py - it.y);
      if (dd < bestD) {
        bestD = dd;
        best = d;
      }
    }
    return { ...it, reach: best / total };
  });
  const coolerOn = interpolate(frame, [coolerAt, coolerAt + 10], [0, 1], clamp);
  const head = pointAt(total * progress);

  return (
    <div style={{ alignSelf: "center", opacity: enter, transform: `translateY(${(1 - enter) * 40 * s}px)` }}>
      <svg width={W * 0.86 * s} height={H * 0.86 * s} viewBox={`0 0 ${W} ${H}`}>
        {/* store outline */}
        <rect x={10} y={40} width={W - 20} height={H - 60} rx={18} fill={C.surface} stroke={C.accent} strokeWidth={5} />
        {/* door */}
        <rect x={270} y={H - 26} width={100} height={12} fill={C.bg} />
        <text x={320} y={H - 30} textAnchor="middle" fontFamily={theme.fonts.body} fontWeight={700} fontSize={20} letterSpacing={2} fill={C.inkMuted}>
          DOOR
        </text>
        {/* dairy cooler along the back wall */}
        <rect x={30} y={56} width={W - 60} height={40} rx={8} fill={C.accentLight} opacity={0.25 + 0.75 * coolerOn} style={{ filter: coolerOn ? `drop-shadow(0 0 ${18 * coolerOn}px ${C.accent})` : undefined }} />
        <text x={W / 2} y={84} textAnchor="middle" fontFamily={theme.fonts.body} fontWeight={800} fontSize={22} letterSpacing={2} fill={C.onAccent}>
          MILK · EGGS · BREAD
        </text>
        {/* aisles */}
        {aisles.map((a, i) => (
          <rect key={i} x={a.x} y={a.y} width={a.w} height={a.h} rx={6} fill={C.bgAlt} stroke={C.line} strokeWidth={3} />
        ))}
        {/* path */}
        {dots.map((d) => {
          const [x, y] = pointAt(d);
          return <circle key={d} cx={x} cy={y} r={5} fill={C.ink} opacity={0.85} />;
        })}
        {progress > 0 && progress < 1 ? <circle cx={head[0]} cy={head[1]} r={11} fill={C.accentLight} stroke={C.bg} strokeWidth={3} /> : null}
        {/* impulse displays */}
        {items.map((it, i) => {
          const lit = progress >= it.reach;
          const litAt = pathFrom + it.reach * (pathTo - pathFrom);
          const bump = lit ? interpolate(frame - litAt, [0, 4, 10], [1, 1.35, 1], clamp) : 1;
          return (
            <rect
              key={i}
              x={it.x - 18}
              y={it.y - 18}
              width={36}
              height={36}
              rx={6}
              fill={lit ? C.accent : C.surface}
              stroke={lit ? C.accentLight : C.inkMuted}
              strokeWidth={3}
              transform={`translate(${it.x} ${it.y}) scale(${bump}) translate(${-it.x} ${-it.y})`}
              style={{ filter: lit ? `drop-shadow(0 0 10px ${C.accent})` : undefined }}
            />
          );
        })}
      </svg>
    </div>
  );
};

/** One line of text under the map ("Milk, eggs, bread → the back"). */
export const MapLabel: React.FC<{ delay: number; children: React.ReactNode }> = ({ delay, children }) => {
  const frame = useCurrentFrame();
  const { s } = useStage();
  const o = interpolate(frame, [delay, delay + 10], [0, 1], clamp);
  return (
    <div
      style={{
        fontFamily: theme.fonts.display,
        fontWeight: 800,
        fontSize: 52 * s,
        color: C.ink,
        opacity: o,
        transform: `translateY(${(1 - o) * 16 * s}px)`,
        lineHeight: 1.1,
      }}
    >
      {children}
    </div>
  );
};
