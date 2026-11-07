import React, { useId } from "react";

const GEAR_PATH =
  "M450.1 146.1 L500.2 138.0 L509.6 89.0 L570.4 89.0 L579.8 138.0 L629.9 146.1 L678.6 160.5 L708.3 120.5 L763.1 146.9 L750.3 195.1 L791.9 224.1 L829.5 258.2 L873.6 235.0 L911.5 282.6 L879.2 320.5 L904.0 364.7 L923.1 411.7 L972.9 410.0 L986.4 469.3 L940.8 489.4 L944.0 540.0 L940.8 590.6 L986.4 610.7 L972.9 670.0 L923.1 668.3 L904.0 715.3 L879.2 759.5 L911.5 797.4 L873.6 845.0 L829.5 821.8 L791.9 855.9 L750.3 884.9 L763.1 933.1 L708.3 959.5 L678.6 919.5 L629.9 933.9 L579.8 942.0 L570.4 991.0 L509.6 991.0 L500.2 942.0 L450.1 933.9 L401.4 919.5 L371.7 959.5 L316.9 933.1 L329.7 884.9 L288.1 855.9 L250.5 821.8 L206.4 845.0 L168.5 797.4 L200.8 759.5 L176.0 715.3 L156.9 668.3 L107.1 670.0 L93.6 610.7 L139.2 590.6 L136.0 540.0 L139.2 489.4 L93.6 469.3 L107.1 410.0 L156.9 411.7 L176.0 364.7 L200.8 320.5 L168.5 282.6 L206.4 235.0 L250.5 258.2 L288.1 224.1 L329.7 195.1 L316.9 146.9 L371.7 120.5 L401.4 160.5 Z M892 540 A352 352 0 1 0 188 540 A352 352 0 1 0 892 540 Z";

export type LogoProps = {
  size: number;
  /** Gear rotation in degrees. Animate it for a turning mechanism. */
  gearRotation?: number;
  /** 0 → 1: draws the M stroke. */
  mProgress?: number;
  /** 0 → 1: scales the arrowhead in. */
  arrowProgress?: number;
  /** Dark round badge behind the mark (use on light or busy backgrounds). */
  badge?: boolean;
};

/**
 * The Money Mechanism logo as vector, so it can be animated and stays sharp
 * at any size. Same design as public/brand/money-mechanism-logo.png.
 * With default props it renders the finished logo.
 */
export const Logo: React.FC<LogoProps> = ({
  size,
  gearRotation = 0,
  mProgress = 1,
  arrowProgress = 1,
  badge = false,
}) => {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1080 1080"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFE08A" />
          <stop offset="0.45" stopColor="#F2B824" />
          <stop offset="1" stopColor="#B97F00" />
        </linearGradient>
        <linearGradient id={`m${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD866" />
          <stop offset="1" stopColor="#E3A300" />
        </linearGradient>
      </defs>
      {badge ? <circle cx="540" cy="540" r="540" fill="#0B0B0D" /> : null}
      <path
        d={GEAR_PATH}
        fill={`url(#g${id})`}
        fillRule="evenodd"
        transform={`rotate(${gearRotation} 540 540)`}
      />
      <polyline
        points="345,770 345,395 540,610 735,395 735,770"
        fill="none"
        stroke={`url(#m${id})`}
        strokeWidth={100}
        strokeLinejoin="miter"
        strokeMiterlimit={3}
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - mProgress}
      />
      <g
        transform={`translate(735 300) scale(${arrowProgress}) translate(-735 -300)`}
        opacity={arrowProgress > 0 ? 1 : 0}
      >
        <polygon
          points="735,170 860,385 610,385"
          fill="#FFD866"
          stroke="#0B0B0D"
          strokeWidth={22}
          strokeLinejoin="round"
          paintOrder="stroke"
        />
      </g>
    </svg>
  );
};
