# Why is it always $9.99?
Series: Priced In · Length: ~31 s of content (+3.5 s end card) · Format: Reels 1080×1920

## Voice-over brief
- VOICE: "DVYNE Money voice" (create once: Shared assets › Voice design prompt). Same voice every video.
- SETTINGS: Stability 40% · Similarity 75% · Style exaggeration 15% · Speaker boost on · Speed 1.05
- DELIVERY: Playful and quick, a knowing smile in the voice; light emphasis on the twist.
- SAVE AS: `public/videos/why-999/voiceover.mp3` (MP3, 44.1 kHz, ~−14 LUFS)
- Music: track 3 "Playful" (once licensed) · No images

SCRIPT (paste only this; 83 words ≈ 30 s):

> Why is everything nine ninety-nine? Because your brain reads left to right. It sees the nine first and files the price under nine dollars, not ten. Researchers call it the left-digit effect. One cent, and a ten-dollar thing feels like a nine-dollar thing. You'll see it everywhere: gas priced to nine-tenths of a cent, restaurant menus, streaming subscriptions. So why do luxury brands do the opposite? Because a round price says, we're not trying to trick you. One cent. That's the whole trick.

Angle: the 1¢ a store gives up buys a price that *feels* cheaper than it is, and luxury brands skip the trick on purpose.

**Current voiceover.mp3**: Google AI Studio (Gemini TTS) take supplied by the user ("Generated Audio November 08, 2026 - 1_21AM.wav", 24 kHz). Script with "…"/"—" pauses and line-by-line delivery notes. Converted to 44.1 kHz MP3, loudnorm −14 LUFS, 36.65 s. Gemini gives no word timings, so captions.json is aligned to the audio: phrases from its silence map, words spread by syllables and snapped to energy dips (accurate per phrase, approximate within a phrase). For monetization, generate with a paid key and a non-Preview model (see licensing notes). If the voice-over is replaced, re-time `BEATS` and the delays in Video.tsx. The earlier Ava take is kept outside the repo as a backup.

**Music & SFX** (all original, synthesized by `scripts/audio/`): `music/track-3-playful.mp3` at 0.12 under the voice (15-frame fade in, 30-frame fade out). SFX, one per beat at most: `price-tag-roll` (hook flip and payoff flip, synced to the wheels), `pop` (Gus's bubble), `mechanical-click` ($9.99 card lands). Voice plays at 0.85 for mix headroom (peak −1.4 dBFS).

## Scenes
Seconds are estimates (word position ÷ ~2.7 words/s); re-time to the real voiceover.mp3 once it's transcribed.

| # | Scene | Seconds | Voice-over | On screen | Component |
| --- | --- | --- | --- | --- | --- |
| 1 | Hook | 0–1.8 | "Why is everything nine ninety-nine?" | Kicker "Priced In" · "Why is it always **$9.99**?" · price tag flips $10.00 → $9.99 with a click, the 9s roll in like an odometer | Kicker + HookText + PriceTag (new) |
| 2 | Setup | 1.8–4.4 | "Because your brain reads left to right." | "Your brain reads **left to right**" · the "9" glows, ".99" dims | HookText + PriceTag (dim ending) |
| 3 | Meme | 4.4–9.5 | "It sees the nine first and files the price under nine dollars, not ten." | "My brain seeing $9.99" → Gus the Gear shrugs: "basically **$9**" | Mascot pose="shrug" (new) |
| 4 | Mechanism 1 | 9.5–15.8 | "Researchers call it the left-digit effect. One cent, and a ten-dollar thing feels like a nine-dollar thing." | $10.00 vs **$9.99** · note "Real gap: 1¢" | VersusCard + SourceNote |
| 5 | Mechanism 2 | 15.8–21.2 | "You'll see it everywhere: gas priced to nine-tenths of a cent, restaurant menus, streaming subscriptions." | 1. Gas: priced to 9/10 of a cent · 2. Menus: $12.99, not $13 · 3. Subscriptions: $14.99 a month | ListReveal + SourceNote |
| 6 | Twist | 21.2–28.2 | "So why do luxury brands do the opposite? Because a round price says, we're not trying to trick you." | "**$9.99** says deal" / "**$300** says quality" | VersusCard + SourceNote |
| 7 | Payoff | 28.2–31 | "One cent. That's the whole trick." | "One cent. That's the **whole trick**." · tag clicks back to $9.99 | HookText |
| 8 | End card | +3.5 | — | Logo end card (automatic) | BrandedVideo |

Notes
- Fact-check flags on this voice-over: **decided 2026-11-08, keep as written** (user's call). For the record:
  - Beats 3–4: "files the price under nine dollars, not ten" and "a ten-dollar thing feels like a nine-dollar thing" put a dollar size on the effect. Thomas & Morwitz show a 1¢ drop that changes the left digit makes a price feel noticeably lower, not that it feels a full dollar lower. Softer: "…and the price feels closer to nine than ten." / "One cent off, and a ten-dollar thing suddenly feels cheaper." (Beat 3's on-screen "basically $9" is the meme's joke, so it can stay.)
  - Beat 6: "we're not trying to trick you" is our interpretation. Stiving (2000) supports "round prices signal quality". Closer to the source: "Because a round price says quality, not deal."
- Runs ~31 s, not the ~40 s first planned. That's still within the 30–75 s range.
- The "$300" in beat 6 and the menu/subscription prices are illustrative, not quotes of any real brand's prices.
- New components (theme tokens only, vector, no emoji): `PriceTag` (flip + odometer digits) and `Mascot` (Gus the Gear per the Shared assets sheet: gold 12-tooth gear, dot eyes, tiny mouth, stick arms). The Gus PNGs aren't in `public/brand/` yet and no images are being generated, so `Mascot` draws Gus as vector; it can swap to the PNGs later.
- SFX: soft mechanical click on each tag flip and digit landing (style guide: no cash registers).

## Sources
- Manoj Thomas & Vicki Morwitz, "Penny Wise and Pound Foolish: The Left-Digit Effect in Price Cognition," *Journal of Consumer Research* 32(1), 54–64, June 2005. doi:10.1086/429600, https://ideas.repec.org/a/oup/jconrs/v32y2005i1p54-64.html
- Mark Stiving, "Price-Endings When Prices Signal Quality," *Management Science* 46(12), 1617–1629, Dec 2000. doi:10.1287/mnsc.46.12.1617.12078, https://ideas.repec.org/a/inm/ormnsc/v46y2000i12p1617-1629.html (firms use more round prices for higher-quality products)
- NACS (National Association of Convenience Stores), "Why Gas Is Priced Using Fractions of a Penny," https://www.convenience.org/topics/fuels-and-energy/why-gas-is-priced-using-fractions-of-a-penny
- HowStuffWorks, "Why Is 9/10 Added to Gas Prices?", https://auto.howstuffworks.com/fuel-efficiency/fuel-consumption/why-is-9-10-added-to-gas-prices.htm

On-screen SourceNotes
- Beat 4: "Thomas & Morwitz, Journal of Consumer Research, 2005"
- Beat 5: "Gas pricing: NACS"
- Beat 6: "Stiving, Management Science, 2000"
