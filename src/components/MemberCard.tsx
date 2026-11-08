import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, useScale } from "../brand";
import { gearPath } from "./Mascot";

export type MemberCardProps = {
  /** Entrance frame for the wallet. */
  delay?: number;
  /** Frame the card slides up out of the wallet. */
  slideAt?: number;
  /** Frame the card turns into a gear that starts driving the warehouse. */
  gearAt?: number;
  /** Text on the card. Default "MEMBER". No real brand marks. */
  cardText?: string;
};

const BIG = gearPath(100, 82);
const SMALL = gearPath(100, 80, 10);

/**
 * A membership card slides out of a wallet, then becomes a turning gear that
 * drives a smaller gear and lights up a warehouse: the card is the engine.
 */
export const MemberCard: React.FC<MemberCardProps> = ({
  delay = 0,
  slideAt = 15,
  gearAt = 50,
  cardText = "MEMBER",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useScale();
  const c = theme.colors;

  const appear = spring({ frame: frame - delay, fps, config: theme.motion.spring });
  const slide = spring({ frame: frame - slideAt, fps, config: theme.motion.spring });
  const morph = spring({ frame: frame - gearAt, fps, config: theme.motion.spring });
  const run = Math.max(0, frame - gearAt);
  const turn = run * 2.4 * morph; // degrees
  const wallet = 1 - morph;
  const glow = interpolate(run, [10, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const W = 900;
  const H = 640;

  return (
    <div style={{ alignSelf: "center", opacity: appear, transform: `translateY(${(1 - appear) * 40 * s}px)` }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W * s * 0.8} height={H * s * 0.8} style={{ overflow: "visible" }}>
        {/* Warehouse the gears power (fades in with the gear) */}
        <g opacity={morph} transform="translate(560 250)">
          <path
            d="M 0 120 L 0 30 L 130 -40 L 260 30 L 260 120 Z"
            fill={c.surface}
            stroke={glow > 0.5 ? c.accent : c.inkMuted}
            strokeWidth={6}
            strokeLinejoin="round"
          />
          {[0, 1, 2].map((k) => (
            <rect key={k} x={36 + k * 70} y={56} width={48} height={64} rx={4} fill={c.accentLight} opacity={0.15 + 0.75 * glow} />
          ))}
          {/* Drive belt from the small gear */}
          <path d="M -40 70 L 0 70" stroke={c.line} strokeWidth={6} strokeLinecap="round" />
        </g>
        {/* Small driven gear */}
        <g opacity={morph} transform={`translate(470 330) rotate(${-turn * 1.2}) scale(0.55)`}>
          <path d={SMALL} fill={c.surface} stroke={c.accent} strokeWidth={10} strokeLinejoin="round" />
          <circle r={26} fill={c.bg} stroke={c.accent} strokeWidth={8} />
        </g>
        {/* Big gear (the card, transformed) */}
        <g opacity={morph} transform={`translate(300 300) rotate(${turn}) scale(${0.6 + 0.4 * morph})`}>
          <path d={BIG} fill={c.accent} stroke={c.onAccent} strokeWidth={6} strokeLinejoin="round" />
          <circle r={40} fill={c.bg} stroke={c.onAccent} strokeWidth={6} />
        </g>

        {/* Wallet + card (fade out as the gear takes over) */}
        <g opacity={wallet}>
          {/* Card behind the wallet's front pocket */}
          <g transform={`translate(300 ${390 - 250 * slide}) rotate(${-8 * slide}) scale(${1 - 0.5 * morph})`}>
            <rect x={-200} y={-125} width={400} height={250} rx={24} fill={c.accent} stroke={c.onAccent} strokeWidth={5} />
            <rect x={-160} y={-70} width={70} height={52} rx={8} fill={c.accentDeep} />
            <text
              x={-160}
              y={70}
              fontFamily={theme.fonts.display}
              fontWeight={800}
              fontSize={48}
              letterSpacing={6}
              fill={c.onAccent}
            >
              {cardText}
            </text>
          </g>
          {/* Wallet front */}
          <rect x={60} y={390} width={480} height={230} rx={34} fill={c.surface} stroke={c.inkMuted} strokeWidth={6} />
          <path d="M 60 450 L 540 450" stroke={c.line} strokeWidth={5} />
          <circle cx={490} cy={520} r={16} fill={c.bgAlt} stroke={c.inkMuted} strokeWidth={4} />
        </g>
      </svg>
    </div>
  );
};
