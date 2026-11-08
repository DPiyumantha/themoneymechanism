# Costco barely profits on groceries.
Series: Follow the Money · Length: 46.4 s of content (+3.5 s end card) · Format: Reels 1080×1920
Calendar: November 2026 content calendar, row 7 (#3, Sun Nov 8, slot A, 11:00 AM ET)

Angle: the warehouse is the bait; the membership card is the business. Membership fees are equal to almost two-thirds of Costco's net income.

## Voice-over: Gemini TTS (Google AI Studio › Generate speech)

Single speaker, voice **"Sulafat"** (same voice every video). For monetized videos use a paid API key and a non-Preview TTS model. Export, convert to MP3 44.1 kHz, about −14 LUFS, and save as `public/videos/costco-memberships/voiceover.mp3`. The video plays it automatically once the file exists.

**Style instructions** (paste into the style box):

```
You're a warm, confident American woman in her 30s, the voice of The Money Mechanism, talking to a smart friend. Confident and curious, like explaining a clever business secret to a friend over coffee. Conversational and unhurried: never rushed, salesy or dramatic. Aim for about 42 seconds; natural pauses can add a few.

Delivery:
- Open with "Costco barely profits on groceries." like you're letting them in on something, then a short pause.
- "Seriously." is dry and quick, with a small smile.
- Lean in slightly on "The card in your wallet.", as if sharing something most people miss.
- Short pause at every line break, a longer one at every blank line.
- Say "five point nine billion dollars" and "nine point two billion" clearly and a touch slower; give "almost two-thirds" a little weight.
- Lift the questions as real questions, then answer a touch quieter, as if sharing a secret.
- Count the three gears with a steady, even rhythm.
- Take a full pause before the ending, then land "You're not the customer." and, after a beat, "You're the subscriber." with quiet confidence.
```

**Script with pauses** (paste into the text box; 112 words):

```
Costco barely profits on groceries.

Seriously.
Costco keeps its markups low on almost everything in the warehouse.

So where does the profit come from?

The card in your wallet.
Membership fees brought in five point nine billion dollars last year…
compared with total net income of nine point two billion.
That's equal to almost two-thirds of its profit.

And it works because of three gears.
You pay up front, so you want to get your money's worth.

You shop there more often, so you buy more.
And most members renew, year after year.

Costco doesn't need you to love the groceries.
It needs you to come back.

You're not the customer.

You're the subscriber.
```

**Current voiceover.mp3**: Google AI Studio (Gemini TTS, Sulafat) take supplied by the user ("Generated Audio November 08, 2026 - 9_25AM.wav", 24 kHz mono, 44.6 s). Converted to 44.1 kHz MP3 with loudnorm (measures −15.3 LUFS, peak −1.7 dBTP); played at 0.85. It plays in two parts: everything after 41.3 s ("You're not the customer.") starts 1.2 s later, so the fee chart gets a beat before the payoff. captions.json is aligned to the audio the same way as the gas video (phrases from its silence map, words spread by syllables; accurate per phrase, approximate within one) and already includes the 1.2 s shift. If the voice-over is replaced, re-time `BEATS`, `GAP_AT`/`GAP` and the delays in Video.tsx.

Changes from the calendar script: the `[MEMBERSHIP FEE INCOME]` and `[NET INCOME]` placeholders are filled from the FY2026 10-K, and one line was added ("That's equal to almost two-thirds of its profit.") so the comparison lands. "Equal to" is deliberate: fees are revenue, not profit, so the video compares sizes rather than claiming the fees *are* the profit.

## Music, SFX & image
All audio original, synthesized by `scripts/audio/` (no samples).
- Music: `music/track-1-gold-standard.mp3` (Shared track 1 "Gold Standard", made by `scripts/audio/music-gold-standard.mjs`) at 0.12 under the voice, 15-frame fade in, 30-frame fade out.
- SFX, at most one per beat: `pop` ("Seriously."), `gear-ratchet` (card becomes a gear), `mechanical-click` ($5.9B lands; renewal item; "subscriber"), `record-scratch` (Reality panel), `cash-counter-tick` (fee bars grow).
- Image (optional): the calendar's warehouse aisle. Generate it with the prompt below and save as `public/videos/costco-memberships/warehouse.jpg`; scene 2 shows it automatically (cropped to a wide strip) once the file exists. Without it, scene 2 is text only.
  > wide shot of an empty bulk warehouse aisle with towering shelves of generic unbranded boxes, dark graphite background, warm gold rim light, cinematic, shallow depth of field, photoreal, vertical 4:5, no text, no logos, no brand marks

## Scenes
Seconds below were the pre-voice-over estimates; the real beat starts are 0 · 3.95 · 8.5 · 12.9 · 23.6 · 36.45 · 39.4 · 42.6 · end 46.4 (see `BEATS`).

| # | Scene | Seconds | Voice-over | On screen | Component |
| --- | --- | --- | --- | --- | --- |
| 1 | Hook | 0–3.9 | "Costco barely profits on groceries. Seriously." | Kicker "Follow the Money" · "Costco **barely** profits on groceries." · "Seriously." | Kicker + HookText |
| 2 | Setup | 3.9–8.0 | "Costco keeps its markups low on almost everything in the warehouse." | "**Low** markups on almost everything." · warehouse photo (if supplied) | HookText + PhotoFrame + SourceNote |
| 3 | Turn | 8.0–12.3 | "So where does the profit come from? The card in your wallet." | "So where's the **profit**?" · a MEMBER card slides out of a wallet, becomes a gold gear that turns a smaller gear and lights up a warehouse | HookText + MemberCard (new) |
| 4 | Mechanism 1 | 12.3–22.4 | "Membership fees brought in five point nine billion… net income of nine point two billion. That's equal to almost two-thirds of its profit." | "The **card** pays the bills." · Net income $9.2B vs **Membership fees $5.9B** · "≈ **2/3** of net income" | VersusCard + SourceNote |
| 5 | Mechanism 2 | 22.4–34.1 | "And it works because of three gears…" | "It runs on three **gears**." 1. You pay up front 2. You shop more to make it pay 3. 92.3% renew (US & Canada) | ListReveal + SourceNote |
| 6 | Meme | 34.1–36.85 | "Costco doesn't need you to love the groceries." | Expectation: "I'll just grab milk." (one carton) → **Reality**: "Me, an hour later." (cart overflowing) | ExpectationReality (new) |
| 7 | Mechanism 3 | 36.85–39.7 | "It needs you to come back." | Membership fees by year: FY22 $4.2B → **FY26 $5.9B** | BarChart + SourceNote |
| 8 | Payoff | 39.7–43.8 | "You're not the customer. You're the subscriber." | "You're not the customer. You're the **subscriber**." | HookText |
| 9 | End card | +3.5 | — | Logo end card (automatic) | BrandedVideo |

Notes
- No Costco logo anywhere: the name appears as text only, and the card says "MEMBER".
- Scene 7 runs about 3.2 s, helped by the 1.2 s pause inserted before the payoff.
- FY2022–FY2024 fee figures ($4,224M, $4,580M, $4,828M) are from Costco's 10-Ks as I know them; FY2025 ($5,323M) and FY2026 ($5,907M) were confirmed in the FY2026 results. Recheck FY22–24 against EDGAR before publishing. FY2024 was a 53-week year.
- "Low markups": the 10-K describes the strategy of offering prices consistently lower than elsewhere; the video gives no markup percentage.

## Sources
- Costco Wholesale, Form 10-K for fiscal 2026 (52 weeks ended Aug 30, 2026), SEC EDGAR: membership fees $5,907M (FY2025 $5,323M), net income $9,226M (FY2025 $8,099M), renewal rate 92.3% US & Canada, 89.8% worldwide. Summary: https://www.stocktitan.net/sec-filings/COST/10-k-costco-wholesale-corp-new-files-annual-report-297ca22b29a3.html
- Costco Wholesale, Form 8-K, Q4/FY2026 results (Sep 24, 2026): https://www.sec.gov/Archives/edgar/data/0000909832/000090983226000084/costex9928-k92426.htm
- Costco Form 10-K filings FY2022–FY2024 (membership fees by year), SEC EDGAR: https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000909832&type=10-K

On-screen SourceNotes
- Beat 2: "Costco FY2026 Form 10-K"
- Beat 4: "Costco FY2026 Form 10-K (52 weeks to Aug 30, 2026)"
- Beat 5: "Renewal rate: Costco FY2026 Form 10-K"
- Beat 7: "Costco Form 10-K filings, FY2022–FY2026"

## Post caption
```
Costco barely profits on groceries. So where does the money come from?

Membership fees brought in $5.9 billion last year, equal to almost two-thirds of Costco's $9.2 billion net income. Low prices keep you coming back; the card is what you're really buying.

Did your Costco membership pay for itself this year?

Sources: Costco FY2026 Form 10-K and Q4 FY2026 results (SEC EDGAR)
#TheMoneyMechanism #Costco #BusinessModel
```
