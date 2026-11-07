# The Money Mechanism — video project

This Remotion project makes videos for **The Money Mechanism**, a DVYNE Facebook page about business stories, money, economics and consumer psychology.

**Before making or editing any video, load the `money-mechanism-video` skill** (`.agents/skills/money-mechanism-video/SKILL.md`). It holds the workflow, style guide, voice and scripting rules, component reference and production guide.

Quick rules:
- New videos go in `src/videos/<slug>/`, copied from `src/videos/_template/`, and get one line in `src/videos/index.ts`.
- Every video's root is `<BrandedVideo>`, which adds the watermark and the logo end card. Never build another outro.
- Use `theme` tokens and `src/components` only. No new colors, fonts or emoji.
- Original content only; every figure needs a real source.
- Run `npx tsc --noEmit` and `npx eslint src` before previewing. Render only when asked.

Project map:

| Path | What |
| --- | --- |
| `src/brand/` | `theme`, fonts, vector `Logo`, hooks (`useScale`, `useSafeZone`) |
| `src/components/` | Brand components, end card, captions |
| `src/videos/` | One folder per video + `index.ts` registry |
| `public/brand/money-mechanism-logo.png` | Logo PNG |
| `public/fonts/` | Sora + Inter (bundled, offline) |
| `public/videos/<slug>/` | Voice-over and images per video |
| `public/music/` | Licensed music |
