/**
 * The ONLY file to edit after BLS releases October CPI (Nov 10, 2026, 8:30 AM ET).
 * Until FILLED is true the video shows a DRAFT banner and uses SEPTEMBER 2026 numbers
 * (verified on bls.gov, released Oct 14, 2026) as stand-ins. Do not publish a draft.
 */
export const FILLED = false;

/** Annual all-items CPI-U change, % (not seasonally adjusted). Sept 2026 = 3.7 (BLS). */
export const CPI_PCT = 3.7;
/** What $100 from a year ago costs now: 100 * (1 + CPI_PCT / 100). */
export const HUNDRED_PLUS = 103.7;

/** Biggest movers, 12-month % change. Sept 2026 stand-ins: energy 20.4, shelter 3.2, food 2.5 (BLS). Swap in the October top movers (beef/food, etc). */
export const MOVERS: { label: string; value: number }[] = [
  { label: "Energy", value: 20.4 },
  { label: "Shelter", value: 3.2 },
  { label: "Food", value: 2.5 },
];

export const MONTH = FILLED ? "October" : "September";
export const SOURCE = FILLED
  ? "Source: BLS, Consumer Price Index, October 2026 (released Nov 10, 2026)"
  : "Source: BLS, CPI September 2026 (draft; October due Nov 10)";

/** Scene start times (s). Re-time to the voice-over: hook, stat, versus, chart, meme, fed, payoff, end. */
export const BEATS = [0, 2.6, 8.4, 17.2, 24.2, 28.4, 34.6, 39.4];
