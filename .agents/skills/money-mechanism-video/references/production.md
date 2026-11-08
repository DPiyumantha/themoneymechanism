# Production: voice-over, music, captions, render, upload

## Files for a video

```
src/videos/<slug>/Video.tsx       the composition
src/videos/<slug>/script.md       script + sources
src/videos/<slug>/voice.md        voice spec for Gemini TTS (style + script)
src/videos/<slug>/captions.json   word timings (Caption[])
public/videos/<slug>/voiceover.mp3
public/videos/<slug>/*.jpg        user-supplied images
public/music/<track>.mp3          licensed music
```

## Voice-over

Generated with Gemini TTS by `scripts/voice/generate.mjs`. The page voice is **Sulafat** for every explainer; story episodes use two speakers (Maya=Sulafat with Jake=Puck or Ray=Algenib). Never clone a real person's voice.

### voice.md (one per video, `src/videos/<slug>/voice.md`)

```markdown
# Voice: <slug>
voice: Sulafat                          ← one speaker
speakers: Maya=Sulafat, Jake=Puck       ← OR a two-speaker dialogue (exactly 2; one-word names)
model: <model id>                       ← optional; overrides GEMINI_TTS_MODEL for this video

## Style
<the row's style instructions: persona, pace, target length, delivery bullets>

## Script
<the row's script; line break = short pause, blank line = longer pause; dialogue lines start "Maya: ">
```

Copy Style and Script from the calendar row (Calendar: the two "Gemini TTS" columns; Story series: "speakers & style instructions" without the MODE/Speaker lines, and the dialogue script). The generator refuses to run while the script has an ALL-CAPS `[PLACEHOLDER]`, so fill those with verified figures, written as spoken ("five point nine billion dollars"). Lowercase audio tags are left alone.

### Commands

| Command | Does |
| --- | --- |
| `npm run voice -- <slug>` | Generates the voice-over (skips if voiceover.mp3 exists) |
| `npm run voice -- <slug> --force` | Replaces it; the old file is backed up in `out/voice-takes/<slug>/` |
| `npm run voice -- <slug> --force --takes=3` | 3 takes; take 1 becomes voiceover.mp3, the command prints how to use another |
| `npm run voice -- <slug> --from=<file.wav>` | Uses an existing take or an AI Studio download instead |
| `npm run voice -- --missing` | Every video with a voice.md but no voiceover.mp3 |
| `npm run voice -- --list-models` | TTS models the key can use |
| `npm run voice -- <slug> --dry-run` | Shows the request without calling the API |

Dialogue on newer TTS models (gemini-3.8+) is sent as one part per line tagged with `speechMetadata.speaker`, with the Style in `speechMetadata.style` (2.5 / 3.1 models still get one tagged transcript); the generator picks the format from the model name. Needs `GEMINI_API_KEY` in `.env` (gitignored). Model: `GEMINI_TTS_MODEL` in `.env`, else the newest stable TTS model the key offers (a Preview one only if no stable model exists; it warns). Output: 44.1 kHz mono MP3, loudness-normalized to about −14 LUFS with peaks under −1.5 dBTP, using Remotion's bundled ffmpeg. Raw takes and the exact request are kept in `out/voice-takes/<slug>/`.

Listen to every take before building. If a line is off, regenerate with `--force` (or `--takes=3` and pick); adjust the Style bullets if the same line keeps going wrong. Play it with `<Audio src={staticFile("videos/<slug>/voiceover.mp3")} />` from `@remotion/media`.

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
