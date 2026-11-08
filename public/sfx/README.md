# Sound effects

All original: synthesized from scratch by `scripts/audio/sfx.mjs` (no samples, no third-party audio), so they're free to use in monetized videos. Regenerate with `node scripts/audio/sfx.mjs`.

| File | Use |
| --- | --- |
| `mechanical-click.mp3` | A number or card locking into place |
| `gear-ratchet.mp3` | Something winding up or counting |
| `price-tag-roll.mp3` | `<PriceTag from="10.00" to="9.99">`: start it at `flipAt`; ticks follow the wheels, the clack hits on landing |
| `pop.mp3` | Speech bubble, label or pill appearing |
| `whoosh.mp3` | A push or a big reveal (sparingly) |
| `coin-drop-soft.mp3` | Small money moment |
| `cash-counter-tick.mp3` | Counting up money |
| `receipt-unroll.mp3` | Receipts, fine print, long bills |
| `record-scratch.mp3` | The "wait, what?" reversal |
| `pump-click.mp3` | Gas nozzle latch: gas, fuel, pump moments |

Rules (production guide): one SFX per beat at most; under the voice at `volume` 0.4–0.6; never cash registers or air horns.
