import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, useScale } from "../brand";

export type Bucket = {
  /** Short label under the bucket, 1–2 words ("Crude oil"). */
  label: string;
  /** Amount shown when the coins land ("$25"). */
  amount: string;
  /** Share of the whole, 0–1 (0.5). Sets the fill height and number of coins. */
  share: number;
};

export type CoinBucketsProps = {
  buckets: Bucket[];
  /** Frame each bucket's coins start dropping, timed to the voice-over. */
  at: number[];
  /** Index of the bucket to show in gold. Default 0 (the biggest slice). */
  highlight?: number;
  /** Entrance frame for the empty buckets. */
  delay?: number;
};

const COIN_EVERY = 3; // frames between coins
const FALL = 14; // frames a coin takes to fall

/**
 * Where the money goes: gold coins drop into labeled buckets one bucket at a
 * time, each filling to its share and popping its amount when the coins land.
 */
export const CoinBuckets: React.FC<CoinBucketsProps> = ({ buckets, at, highlight = 0, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useScale();
  const c = theme.colors;
  const appear = spring({ frame: frame - delay, fps, config: theme.motion.spring });

  const W = 205 * s;
  const H = 400 * s;
  const coin = 64 * s;
  const maxShare = Math.max(...buckets.map((b) => b.share));

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start", // labels may wrap to two lines; keep the buckets level
        width: "100%",
        opacity: appear,
        transform: `translateY(${(1 - appear) * 40 * s}px)`,
      }}
    >
      {buckets.map((b, i) => {
        const start = at[i] ?? delay + i * 30;
        const coins = Math.max(2, Math.round(b.share * 20));
        const landAt = start + (coins - 1) * COIN_EVERY + FALL;
        const fill = interpolate(frame, [start + FALL * 0.6, landAt], [0, b.share / maxShare], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const label = spring({ frame: frame - landAt, fps, config: theme.motion.springSnappy });
        const hot = i === highlight;
        const active = frame >= start;
        const fillH = fill * (H - 24 * s);

        return (
          <div key={b.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 * s }}>
            {/* Amount */}
            <div
              style={{
                height: 80 * s,
                fontFamily: theme.fonts.display,
                fontWeight: 800,
                fontSize: (hot ? 70 : 58) * s,
                lineHeight: `${80 * s}px`,
                letterSpacing: "-0.03em",
                color: hot ? c.accentLight : c.ink,
                opacity: label,
                transform: `scale(${0.7 + 0.3 * label})`,
              }}
            >
              {b.amount}
            </div>
            {/* Bucket */}
            <div
              style={{
                position: "relative",
                width: W,
                height: H,
                borderRadius: `${12 * s}px ${12 * s}px ${36 * s}px ${36 * s}px`,
                border: `${5 * s}px solid ${active ? (hot ? c.accent : c.inkMuted) : c.line}`,
                borderTop: "none",
                background: c.surface,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: fillH,
                  background: hot
                    ? `linear-gradient(180deg, ${c.accentLight}, ${c.accentDeep})`
                    : `linear-gradient(180deg, ${c.accent}, ${c.accentDeep})`,
                  opacity: hot ? 1 : 0.55,
                }}
              />
              {/* Falling coins */}
              {Array.from({ length: coins }, (_, k) => {
                const t0 = start + k * COIN_EVERY;
                const p = interpolate(frame, [t0, t0 + FALL], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
                if (frame < t0 || p >= 1) return null;
                const x = ((k * 37) % 70) / 100; // spread across the bucket
                const y = -coin + p * p * (H - fillH);
                return (
                  <div
                    key={k}
                    style={{
                      position: "absolute",
                      left: x * (W - coin),
                      top: y,
                      width: coin,
                      height: coin * 0.42,
                      borderRadius: "50%",
                      background: c.accentLight,
                      border: `${4 * s}px solid ${c.accentDeep}`,
                    }}
                  />
                );
              })}
            </div>
            {/* Label */}
            <div
              style={{
                fontFamily: theme.fonts.body,
                fontWeight: 600,
                fontSize: 34 * s,
                color: hot ? c.ink : c.inkMuted,
                textAlign: "center",
                maxWidth: W + 20 * s,
              }}
            >
              {b.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Frame (relative to the bucket's `at`) when its coins have all landed: for SFX timing. */
export const coinBucketLandFrames = (share: number) => (Math.max(2, Math.round(share * 20)) - 1) * COIN_EVERY + FALL;
