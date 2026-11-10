# October inflation report (CPI day)
Series: The Fine Print · Length: ~36 s · Format: Reels · Status: SHELL, waiting for the Oct CPI release (Nov 10, 2026, 8:30 AM ET)

| # | Scene | Seconds | Voice-over | On screen | Component |
| --- | --- | --- | --- | --- | --- |
| 1 | Hook | 0-2.6 | Prices rose again in October. | "Prices rose again. Here's your $100." | Kicker + HookText |
| 2 | Report | 2.6-8.4 | The new inflation report is out, and prices are up [OCTOBER CPI PERCENT] from a year ago. | Big annual rate + BLS source | StatCard + SourceNote |
| 3 | $100 | 8.4-17.2 | Something that cost one hundred dollars a year ago now costs about [100 PLUS CPI] dollars. | $100 then vs now; $100 bill shrinks while a receipt prints | VersusCard + BillReceipt |
| 4 | Movers | 17.2-24.2 | The biggest movers this month: [TOP CATEGORIES FROM THE RELEASE]. | Bars of biggest movers | BarChart |
| 5 | Meme | 24.2-28.4 | And it matters beyond the grocery store. | "Economists: inflation is cooling / My grocery receipt:" | text split screen |
| 6 | Fed | 28.4-34.6 | Markets now think the Fed could raise rates in December, making cards and loans more expensive. | "Higher odds of a December rate hike" | HookText |
| 7 | Payoff | 34.6-39.4 | Inflation isn't a number. It's your receipt. | Payoff line | HookText |

All numbers and wording live in `data.ts`. Until `FILLED = true` the video shows a red DRAFT banner and uses September 2026 stand-ins.

## Sources
- BLS, Consumer Price Index Summary, September 2026 (released Oct 14, 2026): all items +3.7% over 12 months; energy +20.4%, shelter +3.2%, food +2.5%. https://www.bls.gov/news.release/cpi.nr0.htm
- BLS release schedule: October 2026 CPI on Nov 10, 2026, 8:30 AM ET. https://www.bls.gov/schedule/news_release/cpi.htm
- [VERIFY after release] October all-items 12-month %, top movers, and market odds of a December Fed hike (CME FedWatch) before keeping the "Markets now think" line; if the odds are low, reword it.

## After the release
1. Edit `data.ts` (FILLED, CPI_PCT, HUNDRED_PLUS, MOVERS); edit the three placeholders in `voice.md` (spoken form) and the matching text in this table.
2. `npm run voice -- cpi-day`, then `npm run align -- cpi-day` (writes captions.json), then set `BEATS` in `data.ts` from word times and swap `captions.ts` for captions.json.
