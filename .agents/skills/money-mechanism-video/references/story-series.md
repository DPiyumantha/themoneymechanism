# Story series: "Caught in the Machine"

Short comedy episodes that teach the same money concepts as the explainers, through two characters talking. Same brand, same end card, same rules (original content, real sources, safe zones). Episode plans live on the **Story series** tab of `Money-Mechanism-November-2026-Content-Calendar.xlsx`.

## Premise and cast

| Character | Who | Voice (Gemini TTS) | Look |
| --- | --- | --- | --- |
| **Maya** | The page's own voice, mid-30s. Warm, dry, quietly amused; knows exactly how every trick works. Explains the mechanism straight to the camera. | Sulafat (same as the explainers) | Dark bob, charcoal blazer, gold scarf |
| **Jake** | Maya's roommate, late 20s. Upbeat, impulsive, lovable; falls for every deal, then is genuinely surprised. Never whiny or stupid. | Puck | Messy brown hair, grey hoodie, phone in hand, white sneakers |
| **Grandpa Ray** | Maya's grandfather, mid-70s. Gravelly, warm storyteller who remembers retail history (Toys "R" Us, Blockbuster, Sears, Circuit City). | Algenib | White hair, round glasses, gold cardigan, slight stoop |
| **Gus the Gear** | Silent mascot. Appears only in the Mechanism Moment. | — | `Mascot` |

Two speakers per episode (Gemini's multi-speaker limit): Maya + Jake, or Maya + Ray. Keep the voices fixed for good once chosen. Jake slowly learns across the month; the Nov 30 finale has him shopping Cyber Monday with a plan. Humor is kind: never mock a group, a real person or a real company's staff.

## Format: vertical Reels only

Every episode is a **Facebook Reel: 1080×1920 (9:16), 30 fps**, made to be watched full-screen on a phone. Register it as `MM-Story<Name>` with `format: "reels"`; Root forces Reels for any `MM-Story…` id anyway. Never make feed (16:9) or square versions of a story episode.

On a phone, Facebook covers the top (~8%: header), the right edge from about 55% to 90% down (like, comment, share, more) and the bottom (~17%: name, caption, audio). The kit already keeps clear: characters stand above the bottom UI, bubbles sit between the watermark and the heads, and Gus stays left of the button column. When you add props or graphics, keep them inside `SafeArea` / `useStage()` and away from the right edge below the middle of the frame.

## Episode structure (40–55 s + end card)

1. **Cold open, 0–2 s.** `EpisodeTitle` with the hook (usually the first line of dialogue) in big type. `DialogueCaptions hideBefore` = its duration.
2. **The scene.** Quick back-and-forth. One location per scene; `StoryScene` with the episode's background. Expressions change on the beats.
3. **The Mechanism Moment.** Maya turns to the camera. `MechanismMoment` freezes the scene, sweeps the gold grid, names the mechanism ("THE MECHANISM: DECOY PRICING") and shows **one** explainer graphic with its `SourceNote`; Gus reacts. Captions switch to the plain bottom band (`plainDuring`). Keep it 4–7 s.
4. **The button.** Back in the scene: a short punchline, usually Jake's.
5. **End card.** Automatic (BrandedVideo).

## Building an episode

- Copy `src/videos/_story-template/` to `src/videos/<slug>/` (slugs start `story-`), register `MM-Story<Name>` in `src/videos/index.ts`.
- `voice.md` uses `speakers: Maya=Sulafat, Jake=Puck` (or `Maya=Sulafat, Ray=Algenib`); every script line starts with the speaker name. Generate with `npm run voice -- <slug>` (production.md).
- **Captions:** transcribe `voiceover.mp3` to `captions.json` and add a `speaker` field to every word, taken from the dialogue order in `voice.md` (line by line). `DialogueCaptions`, `useSpeakerTimeline` and the characters' mouths all depend on it.
- One `Scene` component renders the `StoryScene` + `Character`s, driven by `useSpeakerTimeline(captions)`: `talking={tl.isTalking("jake")}`, `bounceAt={tl.lineStartOf("jake")}`. Render it once normally and pass `<Scene />` again as `scene` to `MechanismMoment`.
- Several locations: one `Sequence` per location, each with its own `StoryScene bg`, and a short `whoosh` SFX on the cut.
- Backgrounds: `public/videos/<slug>/bg-N.png` from the row's prompts (no people, no text, no logos). Without one, `StoryScene` falls back to the brand background.
- Props (bags, cups, a TV box): draw them as simple vector shapes in the same outlined style, placed near the characters; or show them inside the Mechanism Moment graphic.
- Music at `volume={0.1}` under the dialogue (dialogue is busier than narration). One SFX per beat at most.

## Story components (`src/components/story`)

| Component | Props | Notes |
| --- | --- | --- |
| `Character` | `name: "maya" \| "jake" \| "ray"`, `expression?: "neutral" \| "happy" \| "surprised" \| "smug" \| "worried"`, `talking?`, `bounceAt?`, `facing?`, `x?` (design px), `height?` (700), `delay?` | Flat vector, breathes and blinks; mouth moves while `talking`. Default spots: Maya left (x 300), others right (x 780), facing each other. |
| `StoryScene` | `bg?`, `pushIn?`, children | Background + slow push-in, readable top/bottom, warm floor light, floor line. Characters go inside. |
| `useSpeakerTimeline(captions)` | → `isTalking(name)`, `lineStartOf(name)`, `speaker`, `lines` | From speaker-tagged captions. |
| `DialogueCaptions` | `captions`, `positions?`, `hideBefore?`, `plainDuring?`, `combineWithinMs?` | Bubble above the speaker in their color (Maya gold, Jake white, Ray cream) with a name tag; plain bottom-band captions during `plainDuring`. |
| `MechanismMoment` | `from`, `durationInFrames`, `label`, `scene`, `gusPose?`, children | Freeze + grey + gold grid + kicker + your graphic + Gus. Children delays are absolute frames (e.g. `delay={MECH_FROM + 14}`). |
| `EpisodeTitle` | `ep`, `title`, `hook?`, `highlight?`, `delay?`, `duration?` (60) | "CAUGHT IN THE MACHINE · EP N · TITLE" pill + the hook. |
| `demoDialogue([[speaker, text, startMs, endMs], …])` | | Preview captions before the voice-over exists. |
| `useStage()` | → `groundY`, `headY`, `xOf(designX)` | Stage geometry, for placing props. |

Gus poses for reactions: `neutral`, `shrug`, `nervous`, `faint`, `thumbs-up`, `salute`, `head-shake`, `sweat`.

## Checklist

- [ ] 1080×1920 Reels (`format: "reels"`, id `MM-Story…`)
- [ ] Hook readable in the first 2 s; dialogue never under the watermark or Facebook's bottom UI; nothing important under the right-hand buttons
- [ ] Every caption word has the right `speaker`; mouths move only on their own lines
- [ ] The Mechanism Moment teaches one thing with one sourced fact
- [ ] Jake is funny, not foolish; no jokes at a real person's or group's expense
- [ ] No real logos, packaging or app designs in backgrounds or props
