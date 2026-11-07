# Production: voice-over, music, captions, render, upload

## Files for a video

```
src/videos/<slug>/Video.tsx       the composition
src/videos/<slug>/script.md       script + sources
src/videos/<slug>/captions.json   word timings (Caption[])
public/videos/<slug>/voiceover.mp3
public/videos/<slug>/*.jpg        user-supplied images
public/music/<track>.mp3          licensed music
```

## Voice-over

- Calm, confident, conversational American English. ~2.6 words/s.
- The user records it or provides an AI voice file. Never clone a real person's voice.
- Loudness: about −14 LUFS integrated, peaks below −1 dBTP.
- Play it with `<Audio src={staticFile("videos/<slug>/voiceover.mp3")} />` from `@remotion/media`.

## Timing scenes to the voice-over

1. Transcribe the voice-over to word timings (below).
2. Find the word where each beat starts; scene length = (next beat start − this beat start) in ms × 30 / 1000, rounded.
3. Add `theme.motion.transitionFrames` to every scene except the last (transitions overlap scenes).
4. `CONTENT_FRAMES` must be ≥ the voice-over length in frames + ~15 frames of breathing room.

## Captions

Use the `remotion-captions` skill (`.agents/skills/remotion-best-practices/remotion-captions/`) to transcribe the voice-over into `Caption[]` JSON (Whisper locally, or OpenAI's API if the user has a key). Save to `src/videos/<slug>/captions.json` and render with `<Captions captions={captions} />`.

Check the transcript: fix company names, and write numbers the way the screen shows them ("$1.50").

## Music and sound

- Minimal hip-hop, lo-fi or dark ambient electronic. Royalty-free or licensed only; keep the license note in `public/music/`.
- Under voice: `volume={0.12}` (about −15 to −18 dB). Fade in over 15 frames and out over 30.
- SFX: soft mechanical clicks on number landings, a subtle whoosh on pushes. No cash registers, coin drops or air horns.

## Render

```bash
npx tsc --noEmit && npx eslint src
npx remotion render MM-<Slug> out/<slug>.mp4
```

`remotion.config.ts` already sets H.264, yuv420p and CRF 18 (high-quality master). For a thumbnail still:

```bash
npx remotion still MM-<Slug> out/<slug>-thumb.png --frame=45
```

## Upload to Facebook

- Upload as a **Reel** from Meta Business Suite; schedule 8–10 AM or 7–9 PM US Eastern.
- Paste the post caption from voice-and-scripts.md.
- Pick the hook frame (around frame 45) as the cover.
- Add the sources in the caption or first comment.

## Final checklist

- [ ] Script facts checked, every figure has a `SourceNote`, no `[VERIFY]` left
- [ ] Hook readable within 2 s, one gold word
- [ ] Only theme colors and fonts; nothing under the watermark or caption band
- [ ] Captions match the voice-over word for word
- [ ] No third-party footage or unlicensed music
- [ ] `tsc` and `eslint` pass; end card plays at the end
