# Gas is $4.10. Where does it go?
Series: The Fine Print · Length: 50.05 s of content (+3.5 s end card) · Format: Reels 1080×1920
Calendar: November 2026 content calendar, row 6 (#2, Sat Nov 7, slot B, 8:30 PM ET)

Angle: the $4.10 on the sign is four businesses and a tax bill stacked up, and the station you pay is the one making the least on it.

## Voice-over: Gemini TTS (Google AI Studio › Generate speech)

Single speaker, voice **"Sulafat"** (same voice every video). For monetized videos use a paid API key and a non-Preview TTS model. Export, convert to MP3 44.1 kHz, about −14 LUFS, and save as `public/videos/gas-dollar-breakdown/voiceover.mp3`. The video plays it automatically once the file exists.

**Style instructions** (paste into the style box):

```
You're a warm, confident American woman in her 30s, the voice of The Money Mechanism, talking to a smart friend. Calm, practical and slightly wry, like a friend who's good with money. Conversational and unhurried: never rushed, salesy or dramatic. Aim for about 45 seconds; natural pauses can add a few.

Delivery:
- Open with "Gas is four dollars and ten cents a gallon." like you're letting them in on something, then a short pause.
- Be crystal clear on every number; never rush a figure.
- Short pause at every line break, a longer one at every blank line.
- Give "About half" a little weight, then list the other slices with a steady rhythm.
- Lift "Why the jump this year?" as a real question, then answer a touch quieter, as if sharing a secret.
- List "coffee… snacks… energy drinks" with a light bounce.
- Take a full pause before the ending, then land "The pump is the last gear in a very long machine." calmly, with a hint of dry wit.
```

**Script with pauses** (paste into the text box; 118 words):

```
Gas is four dollars and ten cents a gallon.

So where does that money actually go?

About half… is the crude oil itself.
Almost a quarter is refining it into gasoline.

About thirteen cents of every dollar gets it to your station: pipelines, trucks, and the station's own costs.
And another thirteen goes to federal and state taxes.

Why the jump this year?

After the Iran war began in February, shipping through the Strait of Hormuz was disrupted… and crude prices spiked.
Gas peaked at four fifty-six in May.

And the station owner often makes just cents a gallon on fuel.
The real money is inside: coffee… snacks… energy drinks.

The pump is the last gear… in a very long machine.
```

The calendar's `[VERIFY: say each slice's share…]` placeholder is filled with EIA's August 2026 split (crude 50%, refining 24%, distribution & marketing 13%, taxes 13%), which replaces the calendar's generic slice list.

**Current voiceover.mp3**: Google AI Studio (Gemini TTS, Sulafat) take supplied by the user ("Generated Audio November 08, 2026 - 2_13AM.wav", 24 kHz mono, 49.84 s). Converted to 44.1 kHz MP3 with loudnorm (measures −15.1 LUFS, peak −1.7 dBTP); played at 0.85. Gemini gives no word timings, so captions.json is aligned to the audio: phrases from its silence map, words spread by syllables and snapped to energy dips (accurate per phrase, approximate within one). Scenes are timed to it; if the voice-over is replaced, re-time `BEATS` and the delays in Video.tsx.

## Music & SFX
All original, synthesized by `scripts/audio/` (no samples).
- Music: `music/track-2-tension.mp3` (Shared track 2 "Tension", made by `scripts/audio/music-tension.mjs`) at 0.12 under the voice, 15-frame fade in, 30-frame fade out.
- SFX, at most one per beat: `pump-click` (hook number lands; station beat), `cash-counter-tick` (pump counter runs), `coin-drop-soft` (crude bucket fills), `mechanical-click` ($4.56 peak bar), `gear-ratchet` (payoff). `pump-click` is new in `scripts/audio/sfx.mjs`.

## Scenes
Seconds below were the pre-voice-over estimates; the real beat starts are 0 · 3.6 · 6.9 · 24.3 · 36.8 · 45.9 · end 50.05 (see `BEATS`).

| # | Scene | Seconds | Voice-over | On screen | Component |
| --- | --- | --- | --- | --- | --- |
| 1 | Hook | 0–3.3 | "Gas is four dollars and ten cents a gallon." | Kicker "The Fine Print" · "Gas is **$4.10**. Where does it go?" · $4.10 counts up | Kicker + HookText + StatCard + SourceNote |
| 2 | Meme | 3.3–6.1 | "So where does that money actually go?" | "Me at the pump:" · pump display spins to $50.00 / 12.195 gal · Gus the Gear sweating | PumpCounter (new) + Mascot pose="nervous" (new) |
| 3 | Mechanism 1 | 6.1–21.2 | "About half… is the crude oil itself. Almost a quarter is refining… About thirteen cents… And another thirteen goes to federal and state taxes." | "Where your **$50** goes" · coins drop into 4 buckets as each is named: Crude oil $25 · Refining $12 · Delivery & station $6.50 · Taxes $6.50 | CoinBuckets (new) + SourceNote |
| 4 | Mechanism 2 | 21.2–32.4 | "Why the jump this year? After the Iran war began in February… Gas peaked at four fifty-six in May." | "Why the **jump**?" → "Strait of **Hormuz** disrupted. Crude spiked." → bars Nov '25 $3.06 · **May '26 peak $4.56** · Now $4.10 | HookText + BarChart + SourceNote |
| 5 | Mechanism 3 | 32.4–40.3 | "And the station owner often makes just cents a gallon on fuel. The real money is inside: coffee… snacks… energy drinks." | "The station makes **cents** on gas." → "The real money is **inside**." 1. Coffee 2. Snacks 3. Energy drinks | HookText + ListReveal + SourceNote |
| 6 | Payoff | 40.3–44.6 | "The pump is the last gear… in a very long machine." | "The pump is the last **gear** in a very long machine." | HookText |
| 7 | End card | +3.5 | — | Logo end card (automatic) | BrandedVideo |

Notes
- The $50 split applies EIA's August 2026 shares (retail $4.06) to a $4.10 gallon. Shares move month to month; check the latest EIA panel before publishing and update `BUCKETS` if it changed.
- "Nov '25 $3.06" is the calendar's year-ago figure (via travelerstoday.com, citing AAA). AAA's Nov 5, 2026 release confirms gas is "more than one dollar higher than it was a year ago", which is consistent; the exact $3.06 wasn't checked against AAA directly.
- Station margin: NACS puts the average gross fuel margin around 35.7¢/gal (Feb 2025), about 13¢ net after card fees and costs, and in-store sales supply most of a station's profit. The video says "cents" without a number, so no extra figure is shown.
- No images. Graphics only.

## Sources
- AAA Newsroom, "National Average Falls 12 Cents in One Week", Nov 5, 2026: https://newsroom.aaa.com/2026/11/national-average-falls-12-cents-in-one-week/ ($4.10; more than $1 above a year ago)
- EIA, Gasoline and Diesel Fuel Update, release of Nov 3, 2026, "What we pay for in a gallon of regular gasoline", August 2026 (retail $4.06: crude 50%, refining 24%, distribution & marketing 13%, taxes 13%): https://www.eia.gov/petroleum/gasdiesel/
- EIA, Gasoline explained: factors affecting gasoline prices: https://www.eia.gov/energyexplained/gasoline/factors-affecting-gasoline-prices.php
- CNBC, "Gas prices fall below $4 per gallon as oil supply fears ease after Iran deal", Jun 18, 2026 (peak $4.56 on May 21 per AAA; Hormuz closure after the Feb 28 strikes): https://www.cnbc.com/amp/2026/06/18/iran-war-gasoline-price-strait-hormuz-oil.html
- NACS, "Who Makes Money Selling Gas?": https://www.convenience.org/Media/conveniencecorner/Who-Makes-Money-Selling-Gas

On-screen SourceNotes
- Beat 1: "AAA national average, Nov 5, 2026"
- Beat 3: "EIA, cost shares of a gallon of regular, Aug 2026"
- Beat 4: "AAA; CNBC, Jun 18, 2026"
- Beat 5: "NACS, fuel margins & in-store sales"

## Post caption
```
Gas is $4.10. Where does your fill-up actually go?

About half of every gallon pays for crude oil; refining, delivery and taxes split the rest. The station itself often makes just cents a gallon, so it needs you to come inside.

What's the most you've paid for a fill-up this year?

Sources: AAA (Nov 5, 2026), EIA Gasoline & Diesel Fuel Update (Aug 2026), CNBC, NACS
#TheMoneyMechanism #GasPrices #Economics
```
