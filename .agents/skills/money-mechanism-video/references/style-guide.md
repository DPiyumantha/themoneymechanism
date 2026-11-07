# Visual style guide

**One line:** black and gold, numbers that land hard, a machine clicking into place.

## Formats

| Use | `format` in src/videos/index.ts | Size | Content length |
| --- | --- | --- | --- |
| Reels (default) | `reels` | 1080 × 1920 | 30–75 s |
| Feed video | `feed` | 1920 × 1080 | 1–5 min |
| Square post | `square` | 1080 × 1080 | 15–45 s |
| Portrait post | `portrait` | 1080 × 1350 | 15–45 s |

30 fps always. Everything is designed on a 1080-wide frame: multiply design px by `useScale()`.

## Safe zone (Reels)

Facebook covers parts of a Reel. `useSafeZone()` returns the margins; `<SafeArea>` applies them.

- Top ~14% (269 px): page name, menu. The watermark sits right below.
- Bottom ~28% (538 px): caption text, username, buttons. The caption band sits right above.
- Sides ~6% (65 px). Keep the right edge clear of key text (like/comment buttons).

Vertical stack: watermark → scene content (`SafeArea`) → captions → Facebook UI.

## Color (`theme.colors`)

| Token | Hex | Use |
| --- | --- | --- |
| bg | `#0B0B0D` | Background |
| bgAlt | `#18181C` | Gradient top |
| surface | `#1F1F24` | Cards, panels |
| ink | `#FFFFFF` | Headlines, captions |
| inkMuted | `#B9B9C2` | Labels, sources |
| accent | `#F2B824` | Gold: underlines, bars, outlines, pills |
| accentLight | `#FFD866` | Highlighted word, big numbers, active caption word |
| accentDeep | `#9A6A00` | Gradient bottoms |
| onAccent | `#0B0B0D` | Text on gold |
| positive | `#3DDC84` | Gains |
| negative | `#FF5A4F` | Losses |
| line | gold 28% | Baselines, hairlines |

**Gold marks one thing per frame**: the thing to look at. Everything else is white or grey on black. Never gold body text, never a white background.

## Type (`theme.type`, design px)

| Role | Font / weight | Size |
| --- | --- | --- |
| Hook | Sora 800 | 96 (auto-shrinks for long lines) |
| Big number | Sora 800 | 190 |
| Headline / chart title | Sora 800 | 56–72 |
| Captions | Sora 800 | 66, black outline |
| Body / labels | Inter 600 | 42 |
| Kicker | Inter 700, uppercase, +0.16em | 28 |
| Source | Inter 500 | 26 |

Fonts load from `public/fonts` automatically. Hook lines: keep each under ~16 characters at full size.

## Motion (`theme.motion`)

The feel is **mechanical precision**: fast, firm, no wobble.

- Entrances: `theme.motion.spring`; small items: `springSnappy`.
- Stagger: 4 frames between words or items.
- Words land one by one (`HookText`), numbers count up (`StatCard`), bars grow from the baseline (`BarChart`).
- Scene changes: a push from the right, `theme.motion.transitionFrames` (8 frames), via `TransitionSeries` as in the template. Hard cuts are fine on a beat.
- Never: spins, zoom-throughs, glitch, shake, star wipes, bouncing text.
- One moving thing at a time. Hold every finished scene at least 1 s.

## Scene composition

- One idea per scene, 2–5 s each.
- Left-aligned hooks; centered numbers.
- Empty space is good. Don't fill the frame.
- Photos sit in `PhotoFrame` (gold edge, slow push-in). No full-bleed stock footage.

## Logo

- Animated vector: `<Logo />` from `src/brand` (props `gearRotation`, `mProgress`, `arrowProgress`).
- PNG: `public/brand/money-mechanism-logo.png` (`LOGO_PNG`) for thumbnails or `<Img>`.
- The watermark and end card already show it. Don't add it elsewhere in the video.
