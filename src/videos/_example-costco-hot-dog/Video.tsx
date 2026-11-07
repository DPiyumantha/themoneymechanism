/**
 * EXAMPLE video showing every brand component in use.
 * Sample copy with no voice-over: verify facts before publishing anything based on it.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { theme } from "../../brand";
import {
  BarChart,
  BrandBackground,
  BrandedVideo,
  Captions,
  HookText,
  Kicker,
  ListReveal,
  SafeArea,
  SourceNote,
  StatCard,
  VersusCard,
} from "../../components";
import { demoCaptions } from "../demoCaptions";

const SCENES = { hook: 90, stat: 100, versus: 110, chart: 120, list: 110, payoff: 75 };
const T = theme.motion.transitionFrames;
const n = Object.keys(SCENES).length;
export const CONTENT_FRAMES =
  SCENES.hook + SCENES.stat + SCENES.versus + SCENES.chart + SCENES.list + SCENES.payoff - (n - 1) * T;

const captions = [
  ...demoCaptions("Costco has charged a dollar fifty for this combo since 1985.", 300, 3200),
  ...demoCaptions("Prices everywhere went up. This one never moved.", 3400, 6500),
  ...demoCaptions("So why keep it there? Because it was never about the hot dog.", 6700, 10500),
  ...demoCaptions("It gets you in, it gets you walking, and it gets you renewing.", 10800, 16500),
  ...demoCaptions("It's not a snack. It's a mechanism.", 17000, 19500),
];

const push = () => (
  <TransitionSeries.Transition
    presentation={slide({ direction: "from-right" })}
    timing={linearTiming({ durationInFrames: T })}
  />
);

export const ExampleCostcoHotDog: React.FC = () => (
  <BrandedVideo contentFrames={CONTENT_FRAMES}>
    <BrandBackground />
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={SCENES.hook}>
        <SafeArea>
          <Kicker text="Follow the Money" delay={4} />
          <HookText lines={["Same price.", "40 years."]} highlight={["40"]} delay={10} />
        </SafeArea>
      </TransitionSeries.Sequence>
      {push()}
      <TransitionSeries.Sequence durationInFrames={SCENES.stat}>
        <SafeArea align="center">
          <StatCard value={1.5} prefix="$" decimals={2} label="Hot dog + soda, same price since 1985" delay={6} />
        </SafeArea>
      </TransitionSeries.Sequence>
      {push()}
      <TransitionSeries.Sequence durationInFrames={SCENES.versus}>
        <SafeArea>
          <VersusCard
            left={{ label: "Price today", value: "$1.50" }}
            right={{ label: "With inflation", value: "≈$4.50", note: "1985 dollars in 2026" }}
            delay={6}
          />
          <SourceNote text="Source: [CPI calculation — verify before publishing]" />
        </SafeArea>
      </TransitionSeries.Sequence>
      {push()}
      <TransitionSeries.Sequence durationInFrames={SCENES.chart}>
        <SafeArea>
          <BarChart
            title="What $1.50 buys elsewhere"
            data={[
              { label: "Coffee", value: 0.3, display: "⅓ cup" },
              { label: "Burger", value: 0.2, display: "⅕" },
              { label: "Movie", value: 0.1, display: "⅒" },
              { label: "Costco", value: 1, display: "Full meal" },
            ]}
            delay={6}
          />
          <SourceNote text="Illustrative sample data" />
        </SafeArea>
      </TransitionSeries.Sequence>
      {push()}
      <TransitionSeries.Sequence durationInFrames={SCENES.list}>
        <SafeArea>
          <ListReveal items={["Gets you in the door", "Gets you walking the aisles", "Gets you renewing"]} delay={8} every={28} />
        </SafeArea>
      </TransitionSeries.Sequence>
      {push()}
      <TransitionSeries.Sequence durationInFrames={SCENES.payoff}>
        <SafeArea>
          <HookText lines={["It's not a snack.", "It's a mechanism."]} highlight={["mechanism"]} delay={4} />
        </SafeArea>
      </TransitionSeries.Sequence>
    </TransitionSeries>
    <AbsoluteFill>
      <Captions captions={captions} />
    </AbsoluteFill>
  </BrandedVideo>
);
