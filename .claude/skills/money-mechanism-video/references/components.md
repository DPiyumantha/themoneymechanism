# Components reference

Import from `../../brand` and `../../components` inside `src/videos/<slug>/Video.tsx`.

## Skeleton (from `src/videos/_template/Video.tsx`)

```tsx
const SCENES = { hook: 90, mechanism: 150, payoff: 75 };
const T = theme.motion.transitionFrames;
export const CONTENT_FRAMES = SCENES.hook + SCENES.mechanism + SCENES.payoff - 2 * T; // (scenes - 1) transitions

export const MyVideo: React.FC = () => (
  <BrandedVideo contentFrames={CONTENT_FRAMES}>
    <BrandBackground />
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={SCENES.hook}>
        <SafeArea>…</SafeArea>
      </TransitionSeries.Sequence>
      {push()}
      …
    </TransitionSeries>
    <Audio src={staticFile("videos/<slug>/voiceover.mp3")} />   {/* Audio from "@remotion/media" */}
    <AbsoluteFill><Captions captions={captions} /></AbsoluteFill>
  </BrandedVideo>
);
```

Register: `{ id: "MM-MyVideo", component: MyVideo, contentFrames: CONTENT_FRAMES }` in `src/videos/index.ts`.

## Brand (`src/brand`)

| Export | What |
| --- | --- |
| `theme` | Colors, fonts, type scale, motion, page name, tagline |
| `Logo` | Animatable vector logo |
| `LOGO_PNG` | `staticFile` path of the PNG logo |
| `useScale()` | Multiply design px by this |
| `useSafeZone()` | `{ top, bottom, left, right }` px Facebook covers |
| `sec(n)` | Seconds → frames at 30 fps |
| `brandedDuration(n)`, `endCardFrames()` | Used by Root; you rarely need them |
| `FORMATS`, `FPS` | Output sizes, 30 |

## Components (`src/components`)

| Component | Props | Notes |
| --- | --- | --- |
| `BrandedVideo` | `contentFrames`, `watermark?` | Root of every video. Adds watermark + end card. |
| `BrandBackground` | `textured?` | First child of BrandedVideo. |
| `SafeArea` | `align?: "start"\|"center"`, `justify?`, `reserveCaptions?` | Wrap each scene's content. |
| `Kicker` | `text`, `delay?` | Series label. |
| `HookText` | `lines[]`, `highlight?[]`, `delay?`, `size?`, `align?` | Word-by-word headline; auto-fits long lines. |
| `StatCard` | `value`, `prefix?`, `suffix?`, `decimals?`, `label`, `trend?`, `delay?` | Count-up number. |
| `VersusCard` | `left`, `right` (`{label, value, note?}`), `emphasis?`, `delay?` | Two figures; gold = the reveal. |
| `BarChart` | `data` (`{label, value, display?}[]`), `highlight?`, `title?`, `delay?`, `height?` | 3–7 bars. |
| `ListReveal` | `items[]`, `every?`, `delay?` | Numbered points, timed to VO. |
| `PhotoFrame` | `src`, `caption?`, `aspect?`, `delay?` | `src = staticFile("videos/<slug>/x.jpg")`. |
| `SourceNote` | `text`, `delay?` | Under every figure. |
| `Captions` | `captions: Caption[]`, `combineWithinMs?` | Inside an `AbsoluteFill`, after the scenes. |

`delay` is in frames relative to the scene start. Typical: kicker 4, hook 10, card 6.

## Captions data

```tsx
import captions from "./captions.json"; // Caption[] from @remotion/captions
```

Before a voice-over exists, `demoCaptions(text, startMs, endMs)` from `src/videos/demoCaptions.ts` gives preview captions. Remove it once real captions exist.

## Writing new components

Only when no existing one fits. Put it in `src/components/`, use `theme` tokens, `useScale()`, springs from `theme.motion`, export it from `src/components/index.ts`, and add it to this table.
