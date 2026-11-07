import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Logo, theme, useSafeZone, useScale } from "../brand";
import { BrandBackground } from "./BrandBackground";

/**
 * Branded end card: the gear turns in, the M draws, the arrow pops, then the
 * page name, tagline and follow prompt. 3.5 s. BrandedVideo appends it to
 * every video automatically; never build another one.
 */
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const safe = useSafeZone();
  const s = useScale();
  const landscape = safe.width / safe.height > 1.3;
  const c = theme.colors;

  // Authored at 30 fps; scales to any frame rate.
  const t = (f: number) => (f * fps) / 30;
  const enter = (delay: number, snappy = false) =>
    spring({
      frame: frame - t(delay),
      fps,
      config: snappy ? theme.motion.springSnappy : theme.motion.spring,
    });
  const ease = (from: number, to: number) =>
    interpolate(frame, [t(from), t(to)], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.33, 0, 0.2, 1),
    });
  const rise = (delay: number): React.CSSProperties => {
    const p = enter(delay);
    return { opacity: p, transform: `translateY(${(1 - p) * 40 * s}px)` };
  };

  const cta = enter(46, true);

  return (
    <AbsoluteFill style={{ opacity: ease(0, 8) }}>
      <BrandBackground />
      <div
        style={{
          position: "absolute",
          top: safe.top,
          bottom: safe.bottom,
          left: safe.left,
          right: safe.right,
          display: "flex",
          flexDirection: landscape ? "row" : "column",
          alignItems: "center",
          justifyContent: "center",
          gap: (landscape ? 80 : 44) * s,
        }}
      >
        <Logo
          size={(landscape ? 420 : 340) * s}
          gearRotation={
            interpolate(enter(0), [0, 1], [-120, 0]) + Math.max(0, frame - t(30)) * 0.25
          }
          mProgress={ease(6, 26)}
          arrowProgress={enter(22, true)}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: landscape ? "flex-start" : "center",
          }}
        >
          <div
            style={{
              fontFamily: theme.fonts.display,
              fontWeight: 800,
              fontSize: (landscape ? 116 : 104) * s,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              textAlign: landscape ? "left" : "center",
            }}
          >
            <div style={{ color: c.ink, ...rise(16) }}>{theme.nameLines[0]}</div>
            <div style={{ color: c.accentLight, ...rise(16 + theme.motion.stagger) }}>
              {theme.nameLines[1]}
            </div>
          </div>
          <div
            style={{
              width: 170 * s * ease(30, 44),
              height: 8 * s,
              borderRadius: 4 * s,
              background: c.accent,
              marginTop: 26 * s,
            }}
          />
          <div
            style={{
              fontFamily: theme.fonts.body,
              fontWeight: 500,
              fontSize: 40 * s,
              color: c.inkMuted,
              marginTop: 24 * s,
              opacity: ease(34, 46),
            }}
          >
            {theme.tagline}
          </div>
          <div
            style={{
              marginTop: 40 * s,
              display: "flex",
              alignItems: "center",
              gap: 16 * s,
              padding: `${20 * s}px ${38 * s}px`,
              borderRadius: 999,
              background: c.accent,
              color: c.onAccent,
              fontFamily: theme.fonts.body,
              fontWeight: 700,
              fontSize: 34 * s,
              opacity: cta,
              transform: `scale(${0.8 + 0.2 * cta})`,
            }}
          >
            <svg
              width={36 * s}
              height={36 * s}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="8" r="4" />
              <path d="M2 21c0-3.9 3.1-7 7-7s7 3.1 7 7" />
              <path d="M19 8v6M16 11h6" />
            </svg>
            {theme.cta}
          </div>
          <div
            style={{
              marginTop: 26 * s,
              fontFamily: theme.fonts.body,
              fontWeight: 600,
              fontSize: 24 * s,
              letterSpacing: "0.3em",
              color: c.inkMuted,
              opacity: ease(54, 66),
            }}
          >
            {theme.network}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
