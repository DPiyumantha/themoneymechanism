---
name: money-mechanism-video
description: Make a new video for The Money Mechanism Facebook page (business stories, money, economics, consumer psychology) in this Remotion project. Use for any request to create, script, build, edit or render a video here, so every video follows the brand style, voice and structure and ends with the logo end card.
---

# The Money Mechanism — making a video

Every video in this project is for **The Money Mechanism**, a DVYNE page that explains how money really works through the stories of the businesses behind it. Audience: US adults 25–45 scrolling Facebook, mostly muted. Goal: original, high-retention Reels that qualify for Facebook monetization.

Load the references as you go:

| When | Read |
| --- | --- |
| Writing or reviewing a script, hook, on-screen text or post caption | [references/voice-and-scripts.md](references/voice-and-scripts.md) |
| Choosing colors, type, layout, motion, scene design | [references/style-guide.md](references/style-guide.md) |
| Writing the TSX | [references/components.md](references/components.md) |
| Voice-over, music, captions, rendering, uploading | [references/production.md](references/production.md) |
| A **story episode** ("Caught in the Machine", slugs `story-…`, Maya / Jake / Grandpa Ray) | [references/story-series.md](references/story-series.md) |

For general Remotion questions use the installed `remotion-best-practices` skill and its sub-skills (captions, render, studio).

## Non-negotiables

1. Every video lives in `src/videos/<slug>/` (kebab-case slug), copied from `src/videos/_template/` (explainers) or `src/videos/_story-template/` (story episodes). Never edit `_template`, `_story-template` or `_example-costco-hot-dog`.
2. The root element is `<BrandedVideo contentFrames={CONTENT_FRAMES}>`. It adds the watermark and the 3.5 s logo end card. Never build another end card, outro or logo sting.
3. Register the video with one line in `src/videos/index.ts` (id `MM-<PascalCaseSlug>`). Root adds the end card length; don't touch `Root.tsx`.
4. Only `theme` tokens and the components in `src/components`. No new colors, fonts, emoji, or CSS transitions. Animate with `useCurrentFrame`, `spring`, `interpolate`.
5. Lay out every scene with `<SafeArea>`; size everything as design px × `useScale()`.
6. Burned-in `<Captions>` on every video with voice-over.
7. **Original content only.** Our script, our voice-over, our graphics. Never use another creator's clip, news footage, or copyrighted music. Photos only if the user supplies them or they are licensed.
8. Facts must be real and checkable. Put a `<SourceNote>` under every figure. If you can't verify a number, say so to the user and leave a `[VERIFY]` placeholder; never invent statistics.
9. Default format is Reels 1080×1920 at 30 fps, 30–75 s of content.

## Workflow

1. **Brief.** Confirm the topic and angle in one line. If the user gave only a topic, pick the angle that answers "how does this actually make money?" and the series it belongs to (see voice-and-scripts.md).
2. **Script.** Write the script with the 5-beat structure, the hook, on-screen text per scene, and sources. Save it as `src/videos/<slug>/script.md`. Show it to the user before building unless they asked you to go straight through.
3. **Voice-over.** Write `src/videos/<slug>/voice.md` from the calendar row's Gemini TTS columns (style + script; story episodes use `speakers:`), fill in every `[PLACEHOLDER]` with a verified figure, then run `npm run voice -- <slug>` to generate `public/videos/<slug>/voiceover.mp3` (production.md, "Voice-over"). If the user supplies a take instead, use `npm run voice -- <slug> --from=<file>`. Then transcribe it to `src/videos/<slug>/captions.json` and time the scenes to it.
4. **Build.** Copy `_template`, set `SCENES` lengths, build each scene with the components, register the video, then run `npx tsc --noEmit` and `npx eslint src`.
5. **Preview.** Open Remotion Studio (`npm run dev`) on the composition and check: hook readable within 2 s, nothing under the watermark or caption band, every figure has a source, end card plays.
6. **Render only when asked:** `npx remotion render MM-<Slug> out/<slug>.mp4`.
7. **Post copy.** Give the user the Facebook caption, 2–3 hashtags and the source list (voice-and-scripts.md, "Post caption").

## Scene recipes

| Beat | Typical component |
| --- | --- |
| Hook (0–3 s) | `Kicker` + `HookText` |
| A single shocking number | `StatCard` + `SourceNote` |
| Price vs cost, then vs now | `VersusCard` |
| Change over time, company vs company | `BarChart` |
| "3 reasons / 3 tricks" | `ListReveal` |
| A product or store | `PhotoFrame` (user-supplied image) |
| Payoff line | `HookText` |
