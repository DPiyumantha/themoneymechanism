import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, useScale } from "../brand";

export type MascotPose =
  | "neutral"
  | "shrug"
  | "nervous"
  | "faint"
  | "thumbs-up"
  | "salute"
  | "head-shake"
  | "sweat";

export type MascotProps = {
  /** Pose Gus moves into at `poseAt`: neutral, shrug, nervous, faint, thumbs-up, salute, head-shake, sweat. */
  pose?: MascotPose;
  /** Entrance frame. */
  delay?: number;
  /** Frame Gus moves from neutral into `pose`. Default: right after the entrance. */
  poseAt?: number;
  /** Optional speech bubble ("basically $9"). */
  says?: string;
  /** Word(s) in the bubble to show in gold. */
  saysHighlight?: string[];
  saysAt?: number;
  /** Width of Gus in design px. Default 420. */
  size?: number;
};

const lerp = (p: number, a: number, b: number) => a + (b - a) * p;

/** 12-tooth gear outline as an SVG path, centered on 0,0. Also used by other gear graphics. */
export const gearPath = (outer: number, root: number, teeth = 12) => {
  const pts: string[] = [];
  const step = (Math.PI * 2) / teeth;
  const at = (r: number, ang: number) => `${(r * Math.cos(ang)).toFixed(2)} ${(r * Math.sin(ang)).toFixed(2)}`;
  for (let k = 0; k < teeth; k++) {
    const t = k * step;
    pts.push(at(root, t - step * 0.3), at(outer, t - step * 0.19), at(outer, t + step * 0.19), at(root, t + step * 0.3));
  }
  return `M ${pts.join(" L ")} Z`;
};
const GEAR = gearPath(100, 84);

/**
 * Gus the Gear: the page's original meme-reaction mascot (Shared assets sheet).
 * A small gold 12-tooth gear with dot eyes, a tiny mouth and stick arms.
 * Drawn as vector; swap to public/brand/gus-the-gear-*.png once those exist.
 */
export const Mascot: React.FC<MascotProps> = ({
  pose = "neutral",
  delay = 0,
  poseAt,
  says,
  saysHighlight = [],
  saysAt,
  size = 420,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useScale();
  const c = theme.colors;

  const appear = spring({ frame: frame - delay, fps, config: theme.motion.spring });
  const pp =
    pose === "neutral"
      ? 0
      : spring({ frame: frame - (poseAt ?? delay + 10), fps, config: theme.motion.springSnappy });
  const bubble = says
    ? spring({ frame: frame - (saysAt ?? (poseAt ?? delay + 10) + 6), fps, config: theme.motion.springSnappy })
    : 0;

  // Shrug drives the arms and raised brows; nervous drives brows, mouth and sweat.
  const p = pose === "shrug" ? pp : 0;
  const nv = pose === "nervous" ? pp : 0;
  // Story-kit poses.
  const fa = pose === "faint" ? pp : 0;
  const tu = pose === "thumbs-up" ? pp : 0;
  const sa = pose === "salute" ? pp : 0;
  const hs = pose === "head-shake" ? pp : 0;
  const sw = pose === "sweat" ? pp : 0;
  const shake = hs * 8 * Math.sin((frame - (poseAt ?? delay + 10)) * 0.55);

  // Teeth turn slowly behind the face, like a gear in a running machine.
  const turn = (frame - delay) * 0.35;

  const arm = (side: 1 | -1) => {
    const sx = 92 * side;
    const sy = 34;
    let ex = lerp(p, 126, 150) * side;
    let ey = lerp(p, 76, 44);
    let hx = lerp(p, 130, 176) * side;
    let hy = lerp(p, 124, -8);
    if (side === 1) {
      // Right arm: thumbs-up raises it, salute brings the hand to the brow.
      ex = lerp(tu, lerp(sa, ex, 150), 156);
      ey = lerp(tu, lerp(sa, ey, -6), 40);
      hx = lerp(tu, lerp(sa, hx, 76), 160);
      hy = lerp(tu, lerp(sa, hy, -66), -34);
    }
    // Faint: Gus lies on his side; one arm flops on the floor, the other flung over his head.
    ex = lerp(fa, ex, side === 1 ? 110 : -140);
    ey = lerp(fa, ey, side === 1 ? 120 : 90);
    hx = lerp(fa, hx, side === 1 ? 100 : -150);
    hy = lerp(fa, hy, side === 1 ? 170 : 160);
    return (
      <g key={side}>
        <path
          d={`M ${sx} ${sy} L ${ex} ${ey} L ${hx} ${hy}`}
          fill="none"
          stroke={c.accent}
          strokeWidth={12}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={hx} cy={hy} r={11} fill={c.accent} />
        {side === 1 && tu > 0 ? (
          <rect x={hx - 6} y={hy - 34 * tu} width={12} height={30 * tu} rx={6} fill={c.accent} />
        ) : null}
        {side === 1 && sa > 0 ? (
          <path
            d={`M ${hx - 30 * sa} ${hy + 6} L ${hx + 18 * sa} ${hy - 8}`}
            stroke={c.accent}
            strokeWidth={14}
            strokeLinecap="round"
          />
        ) : null}
      </g>
    );
  };

  const eyeRy = lerp(p, 10, 6.5) + 3 * nv + 4 * sw;
  const happy = Math.max(tu, sa);
  const browY = lerp(p, -34, -44);
  const mouth =
    nv > 0
      ? `M -18 28 Q -9 ${28 - 8 * nv} 0 28 Q 9 ${28 + 8 * nv} 18 28`
      : hs > 0
        ? `M -16 ${lerp(hs, 24, 30)} Q 0 ${lerp(hs, 36, 26)} 16 ${lerp(hs, 24, 30)}`
        : happy > 0
          ? `M -20 ${lerp(happy, 24, 22)} Q 0 ${lerp(happy, 36, 44)} 20 ${lerp(happy, 24, 22)}`
          : `M -15 ${lerp(p, 24, 30)} Q 0 ${lerp(p, 36, 24)} 15 ${lerp(p, 24, 26)}`;
  // Sweat drops slide down the side of the gear on a loop while nervous.
  const drop = (offset: number, x: number) => {
    const cyc = (((frame - (poseAt ?? delay + 10) + offset) % 36) + 36) % 36 / 36;
    const y = -50 + 70 * cyc;
    return (
      <path
        key={offset}
        d={`M ${x} ${y - 16} Q ${x + 11} ${y} ${x} ${y + 8} Q ${x - 11} ${y} ${x} ${y - 16} Z`}
        fill={c.ink}
        opacity={Math.max(nv, sw) * 0.85 * (1 - cyc)}
      />
    );
  };
  const marks = new Set(saysHighlight.map((w) => w.toLowerCase()));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignSelf: "center",
        width: size * s,
        opacity: appear,
        transform: `translateY(${(1 - appear) * 40 * s}px)`,
      }}
    >
      <svg viewBox="-200 -170 400 330" width={size * s} height={(size * 330 * s) / 400} style={{ overflow: "visible" }}>
        <g
          transform={`translate(${30 * fa} ${-8 * p + 80 * fa}) rotate(${-6 * p + 90 * fa + shake + 4 * sa})`}
        >
          {arm(-1)}
          {arm(1)}
          <path
            d={GEAR}
            transform={`rotate(${turn})`}
            fill={c.accent}
            stroke={c.onAccent}
            strokeWidth={7}
            strokeLinejoin="round"
          />
          <circle r={66} fill={c.accentLight} stroke={c.onAccent} strokeWidth={6} />
          {/* Eyes */}
          <g opacity={1 - fa}>
            <ellipse cx={-24} cy={-8} rx={9} ry={eyeRy} fill={c.onAccent} />
            <ellipse cx={24} cy={-8} rx={9} ry={eyeRy} fill={c.onAccent} />
          </g>
          {fa > 0 ? (
            <g opacity={fa} stroke={c.onAccent} strokeWidth={6} strokeLinecap="round">
              <path d="M -33 -17 L -15 1 M -15 -17 L -33 1" />
              <path d="M 15 -17 L 33 1 M 33 -17 L 15 1" />
            </g>
          ) : null}
          {/* Furrowed brows for the head-shake */}
          <g opacity={hs} stroke={c.onAccent} strokeWidth={6} strokeLinecap="round">
            <path d="M -38 -40 L -14 -34" />
            <path d="M 14 -34 L 38 -40" />
          </g>
          {/* Brows appear for the shrug */}
          <g opacity={p} stroke={c.onAccent} strokeWidth={6} strokeLinecap="round">
            <path d={`M -36 ${browY + 4} L -14 ${browY}`} />
            <path d={`M 14 ${browY} L 36 ${browY + 4}`} />
          </g>
          {/* Worried brows for the nervous pose */}
          <g opacity={nv} stroke={c.onAccent} strokeWidth={6} strokeLinecap="round">
            <path d="M -38 -36 L -14 -44" />
            <path d="M 14 -44 L 38 -36" />
          </g>
          {nv > 0 || sw > 0 ? [drop(0, 80), drop(18, -84), ...(sw > 0 ? [drop(9, 88)] : [])] : null}
          {fa > 0 || sw > 0 ? (
            <ellipse cx={0} cy={30} rx={lerp(Math.max(fa, sw), 2, 10)} ry={lerp(Math.max(fa, sw), 2, 12)} fill={c.onAccent} />
          ) : (
            <path d={mouth} fill="none" stroke={c.onAccent} strokeWidth={6} strokeLinecap="round" />
          )}
        </g>
      </svg>

      {says ? (
        <div
          style={{
            order: -1,
            alignSelf: "center",
            marginBottom: 10 * s,
            transform: `scale(${0.85 + 0.15 * bubble})`,
            opacity: bubble,
            whiteSpace: "nowrap",
            padding: `${22 * s}px ${40 * s}px`,
            borderRadius: 999,
            background: c.surface,
            border: `${4 * s}px solid ${c.line}`,
            fontFamily: theme.fonts.display,
            fontWeight: 800,
            fontSize: 60 * s,
            letterSpacing: "-0.02em",
            color: c.ink,
          }}
        >
          {says.split(" ").map((w, i) => (
            <span key={i} style={{ color: marks.has(w.toLowerCase()) ? c.accentLight : c.ink }}>
              {i ? " " : ""}
              {w}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
};
