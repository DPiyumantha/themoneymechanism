import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, useScale } from "../brand";

export type BarDatum = {
  /** Category under the bar, 1–2 short words ("2020", "Netflix"). */
  label: string;
  value: number;
  /** Text above the bar. Defaults to the value. ("$4.2B", "31%") */
  display?: string;
};

export type BarChartProps = {
  data: BarDatum[];
  /** Index of the bar to make solid gold. Default: the last bar. */
  highlight?: number;
  /** Optional title above the chart. */
  title?: string;
  delay?: number;
  /** Height of the tallest bar in design px. */
  height?: number;
};

/**
 * Vertical bars that grow from a gold baseline, one after another.
 * 3–7 bars. The highlighted bar carries the point; the rest are dim gold.
 */
export const BarChart: React.FC<BarChartProps> = ({
  data,
  highlight = data.length - 1,
  title,
  delay = 0,
  height = 420,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useScale();
  const max = Math.max(...data.map((d) => d.value), 1);
  const c = theme.colors;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 * s, width: "100%" }}>
      {title ? (
        <div
          style={{
            fontFamily: theme.fonts.display,
            fontWeight: 800,
            fontSize: 56 * s,
            letterSpacing: "-0.02em",
            color: c.ink,
          }}
        >
          {title}
        </div>
      ) : null}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 22 * s,
          height: (height + 70) * s,
          borderBottom: `${3 * s}px solid ${c.line}`,
        }}
      >
        {data.map((d, i) => {
          const p = spring({
            frame: frame - delay - i * theme.motion.stagger * 1.5 * (fps / 30),
            fps,
            config: theme.motion.spring,
          });
          const hit = i === highlight;
          return (
            <div
              key={d.label}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 12 * s,
                height: "100%",
              }}
            >
              <div
                style={{
                  fontFamily: theme.fonts.display,
                  fontWeight: 800,
                  fontSize: (hit ? 44 : 34) * s,
                  color: hit ? c.accentLight : c.inkMuted,
                  opacity: p,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {d.display ?? d.value.toLocaleString("en-US")}
              </div>
              <div
                style={{
                  width: "100%",
                  height: (d.value / max) * height * s * p,
                  borderRadius: `${8 * s}px ${8 * s}px 0 0`,
                  background: hit
                    ? `linear-gradient(180deg, ${c.accentLight}, ${c.accentDeep})`
                    : `linear-gradient(180deg, rgba(242,184,36,0.45), rgba(242,184,36,0.08))`,
                }}
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 22 * s, marginTop: -14 * s }}>
        {data.map((d, i) => (
          <div
            key={d.label}
            style={{
              flex: 1,
              textAlign: "center",
              fontFamily: theme.fonts.body,
              fontWeight: 600,
              fontSize: 28 * s,
              color: i === highlight ? c.ink : c.inkMuted,
            }}
          >
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
};
