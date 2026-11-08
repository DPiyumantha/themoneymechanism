import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CHARACTER_HEIGHT, POSITIONS, useStage, type CastName } from "./stage";

export type Expression = "neutral" | "happy" | "surprised" | "smug" | "worried";

export type CharacterProps = {
  name: CastName;
  expression?: Expression;
  /** Mouth animates while true. Usually `timeline.isTalking(name)`. */
  talking?: boolean;
  /** Which way the character faces. Default: toward the center of the frame. */
  facing?: "left" | "right";
  /** Horizontal center in design px (0–1080). Default: left spot for Maya, right spot otherwise. */
  x?: number;
  /** Height in design px. Default 700. */
  height?: number;
  /** Frame to slide in. */
  delay?: number;
  /** Frame the current line started: a small hop. Usually `timeline.lineStartOf(name)`. */
  bounceAt?: number;
};

const INK = "#0B0B0D";
const OUT = 6;

type Look = {
  skin: string;
  hair: string;
  top: string;
  topDark: string;
  accent: string;
  pants: string;
  shoes: string;
};

const LOOKS: Record<CastName, Look> = {
  maya: { skin: "#B97A56", hair: "#1C1517", top: "#3A3A44", topDark: "#2A2A31", accent: "#F2B824", pants: "#16161A", shoes: "#0B0B0D" },
  jake: { skin: "#E6B48C", hair: "#5A3A24", top: "#8A8A93", topDark: "#6C6C75", accent: "#F4F4F6", pants: "#34405A", shoes: "#F4F4F6" },
  ray: { skin: "#E3B08A", hair: "#EDEDED", top: "#C9962A", topDark: "#A87A1C", accent: "#F4F1EA", pants: "#3A3A42", shoes: "#2A1E14" },
};

/**
 * A story-series character (Maya, Jake or Grandpa Ray), flat vector in the
 * brand palette, drawn in the same simple style as Gus. Stands on the stage
 * floor (useStage), breathes, blinks, and moves its mouth while talking.
 * Coordinates: feet at (0, 0), head at about y = -790 in a 900-unit-tall figure.
 */
export const Character: React.FC<CharacterProps> = ({
  name,
  expression = "neutral",
  talking = false,
  facing,
  x,
  height = CHARACTER_HEIGHT,
  delay = 0,
  bounceAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage(height);
  const L = LOOKS[name];
  const cx = x ?? (name === "maya" ? POSITIONS.left : POSITIONS.right);
  const face = facing ?? (cx < 540 ? "right" : "left");
  const seed = name === "maya" ? 0 : name === "jake" ? 37 : 71;

  // Entrance, breathing, blinking, talking, line-start hop.
  const enter = spring({ frame: frame - delay, fps, config: { damping: 200, stiffness: 160 } });
  const t = frame / fps;
  const breathe = Math.sin(t * Math.PI * 0.5 + seed) * 4;
  const blinkCycle = (frame + seed * 3) % 100;
  const eyeOpen = blinkCycle < 4 ? 0.12 : 1;
  const mouthOpen = talking ? 0.3 + 0.7 * Math.abs(Math.sin(frame * 0.85 + seed)) : 0;
  const hopT = bounceAt === undefined ? 99 : frame - bounceAt;
  const hop = hopT >= 0 && hopT < 9 ? Math.sin((hopT / 9) * Math.PI) * 14 : 0;
  const headTilt = talking ? Math.sin(frame * 0.18 + seed) * 2.5 : Math.sin(t * 0.7 + seed) * 1;
  const stoop = name === "ray" ? 4 : 0;

  const w = (height * stage.s * 400) / 900;
  const h = height * stage.s;
  const slide = (1 - enter) * (cx < 540 ? -80 : 80) * stage.s;

  // ---- face pieces (drawn facing right; the whole figure flips for "left") ----
  const ex = 14; // eyes look slightly toward the facing side
  const eyeY = -796;
  const brow = {
    neutral: [[-62, -836, -26, -838], [8, -838, 44, -836]],
    happy: [[-62, -840, -26, -846], [8, -846, 44, -840]],
    surprised: [[-62, -852, -26, -858], [8, -858, 44, -852]],
    smug: [[-62, -832, -26, -834], [8, -850, 44, -842]],
    worried: [[-62, -834, -26, -848], [8, -848, 44, -834]],
  }[expression];

  let mouth: React.ReactNode;
  if (talking) {
    mouth = <ellipse cx={ex} cy={-742} rx={22} ry={4 + 18 * mouthOpen} fill="#3A1418" stroke={INK} strokeWidth={5} />;
  } else if (expression === "surprised") {
    mouth = <ellipse cx={ex} cy={-740} rx={13} ry={16} fill="#3A1418" stroke={INK} strokeWidth={5} />;
  } else {
    const d = {
      neutral: `M ${ex - 20} -746 Q ${ex} -736 ${ex + 20} -746`,
      happy: `M ${ex - 28} -752 Q ${ex} -722 ${ex + 28} -752`,
      smug: `M ${ex - 22} -742 Q ${ex + 4} -740 ${ex + 26} -756`,
      worried: `M ${ex - 22} -736 Q ${ex} -752 ${ex + 22} -736`,
    }[expression];
    mouth = <path d={d} fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />;
  }

  const hair = {
    maya: (
      <path
        d="M -128 -690 L -132 -800 A 132 132 0 0 1 132 -800 L 128 -690 Q 112 -680 102 -700 L 106 -842 Q 54 -830 8 -880 Q -40 -836 -104 -846 L -104 -700 Q -112 -680 -128 -690 Z"
        fill={L.hair}
        stroke={INK}
        strokeWidth={OUT}
        strokeLinejoin="round"
      />
    ),
    jake: (
      <path
        d="M -120 -790 Q -126 -880 -60 -906 L -44 -944 L -6 -912 L 34 -948 L 52 -908 Q 118 -896 122 -800 Q 98 -836 56 -832 Q 20 -862 -18 -838 Q -70 -858 -120 -790 Z"
        fill={L.hair}
        stroke={INK}
        strokeWidth={OUT}
        strokeLinejoin="round"
      />
    ),
    ray: (
      <g fill={L.hair} stroke={INK} strokeWidth={OUT}>
        <ellipse cx={-108} cy={-808} rx={26} ry={46} />
        <ellipse cx={108} cy={-808} rx={26} ry={46} />
        <path d="M -70 -886 Q 0 -930 70 -886 Q 30 -900 0 -898 Q -30 -900 -70 -886 Z" />
      </g>
    ),
  }[name];

  // ---- body ----
  const arm = (side: 1 | -1, color: string) => {
    const phoneHand = name === "jake" && side === 1;
    const d = phoneHand
      ? `M ${104 * side} -600 Q ${140 * side} -520 ${128 * side} -470 L 48 -478`
      : `M ${104 * side} -600 Q ${138 * side} -480 ${128 * side} -360`;
    const hx = phoneHand ? 48 : 128 * side;
    const hy = phoneHand ? -478 : -360;
    return (
      <g key={side}>
        <path d={d} fill="none" stroke={INK} strokeWidth={46 + OUT * 2} strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} fill="none" stroke={color} strokeWidth={46} strokeLinecap="round" strokeLinejoin="round" />
        {phoneHand ? (
          <g>
            <rect x={18} y={-556} width={52} height={92} rx={10} fill="#1A1A1F" stroke={INK} strokeWidth={OUT} />
            <rect x={25} y={-548} width={38} height={72} rx={5} fill="#FFF4D6" opacity={0.9} />
          </g>
        ) : null}
        <circle cx={hx} cy={hy} r={25} fill={L.skin} stroke={INK} strokeWidth={OUT} />
      </g>
    );
  };

  const torso = (
    <g>
      <path
        d="M -112 -560 Q -116 -646 -40 -652 L 40 -652 Q 116 -646 112 -560 L 104 -330 L -104 -330 Z"
        fill={L.top}
        stroke={INK}
        strokeWidth={OUT}
        strokeLinejoin="round"
      />
      {name === "maya" ? (
        <g>
          <path d="M -40 -652 L -6 -520 L -60 -600 Z" fill={L.topDark} stroke={INK} strokeWidth={4} />
          <path d="M 40 -652 L 6 -520 L 60 -600 Z" fill={L.topDark} stroke={INK} strokeWidth={4} />
          <path d="M -46 -650 Q 0 -620 46 -650 L 18 -590 L 30 -520 L 4 -540 L -12 -520 L -14 -590 Z" fill={L.accent} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        </g>
      ) : null}
      {name === "jake" ? (
        <g>
          <path d="M -70 -650 Q 0 -600 70 -650" fill="none" stroke={L.topDark} strokeWidth={14} strokeLinecap="round" />
          <path d="M -22 -628 L -26 -560 M 22 -628 L 26 -560" stroke={L.accent} strokeWidth={6} strokeLinecap="round" />
          <rect x={-60} y={-440} width={120} height={56} rx={14} fill={L.topDark} stroke={INK} strokeWidth={4} />
        </g>
      ) : null}
      {name === "ray" ? (
        <g>
          <path d="M -40 -652 L 0 -540 L 40 -652 Z" fill={L.accent} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <path d="M 0 -540 L 0 -330" stroke={L.topDark} strokeWidth={6} />
          {[-500, -450, -400].map((yy) => (
            <circle key={yy} cx={14} cy={yy} r={7} fill={L.topDark} stroke={INK} strokeWidth={3} />
          ))}
        </g>
      ) : null}
    </g>
  );

  return (
    <div
      style={{
        position: "absolute",
        left: stage.xOf(cx) - w / 2 + slide,
        top: stage.groundY - h,
        width: w,
        height: h,
        opacity: enter,
        overflow: "visible",
      }}
    >
      <svg
        viewBox="-200 -900 400 900"
        width={w}
        height={h}
        style={{ overflow: "visible", transform: face === "left" ? "scaleX(-1)" : undefined }}
      >
        <ellipse cx={0} cy={-4} rx={130} ry={18} fill="#000000" opacity={0.35} />
        {/* legs + shoes */}
        <g stroke={INK} strokeWidth={OUT} strokeLinejoin="round">
          <rect x={-68} y={-350} width={56} height={330} rx={20} fill={L.pants} />
          <rect x={12} y={-350} width={56} height={330} rx={20} fill={L.pants} />
          <ellipse cx={-46} cy={-20} rx={46} ry={22} fill={L.shoes} />
          <ellipse cx={46} cy={-20} rx={46} ry={22} fill={L.shoes} />
        </g>
        <g transform={`translate(0 ${-hop + breathe * 0.3}) rotate(${stoop} 0 -330)`}>
          {arm(-1, L.top)}
          {name === "jake" ? (
            <path d="M -96 -650 Q -110 -730 -60 -742 L 60 -742 Q 110 -730 96 -650 Z" fill={L.topDark} stroke={INK} strokeWidth={OUT} />
          ) : null}
          {torso}
          {arm(1, L.top)}
          <g transform={`translate(0 ${breathe}) rotate(${headTilt} 0 -660)`}>
            <rect x={-26} y={-690} width={52} height={50} fill={L.skin} stroke={INK} strokeWidth={OUT} />
            {name === "maya" ? (
              <path d="M -128 -690 L -128 -760 L 128 -760 L 128 -690 Q 112 -680 100 -700 L -100 -700 Q -112 -680 -128 -690 Z" fill={L.hair} />
            ) : null}
            <circle cx={0} cy={-790} r={118} fill={L.skin} stroke={INK} strokeWidth={OUT} />
            {hair}
            {/* eyes */}
            <ellipse cx={-44 + ex} cy={eyeY} rx={11} ry={14 * eyeOpen} fill={INK} />
            <ellipse cx={26 + ex} cy={eyeY} rx={11} ry={14 * eyeOpen} fill={INK} />
            <g stroke={INK} strokeWidth={7} strokeLinecap="round">
              {brow.map(([x1, y1, x2, y2], i) => (
                <path key={i} d={`M ${x1 + ex} ${y1} L ${x2 + ex} ${y2}`} />
              ))}
            </g>
            {name === "ray" ? (
              <g fill="none" stroke={INK} strokeWidth={6}>
                <circle cx={-44 + ex} cy={eyeY} r={28} />
                <circle cx={26 + ex} cy={eyeY} r={28} />
                <path d={`M ${-16 + ex} ${eyeY} L ${-2 + ex} ${eyeY}`} />
              </g>
            ) : null}
            {expression === "happy" || expression === "smug" ? (
              <g fill="#E8806A" opacity={0.35}>
                <circle cx={-66 + ex} cy={-760} r={14} />
                <circle cx={52 + ex} cy={-760} r={14} />
              </g>
            ) : null}
            {mouth}
          </g>
        </g>
      </svg>
    </div>
  );
};

