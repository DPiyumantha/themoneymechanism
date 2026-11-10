import type { Caption } from "@remotion/captions";
import { demoCaptions } from "../demoCaptions";

/**
 * PLACEHOLDER captions (evenly spread) until the voice-over exists.
 * After `npm run voice` and `npm run align`, replace with:
 *   import captionsJson from "./captions.json"; export const captions: Caption[] = captionsJson;
 */
export const captions: Caption[] = [
  ...demoCaptions("Prices rose again in October.", 300, 2400),
  ...demoCaptions("The new inflation report is out, and prices are up 3.7% from a year ago.", 3000, 8000),
  ...demoCaptions("Something that cost one hundred dollars a year ago now costs about $103.70.", 8800, 16000),
  ...demoCaptions("The biggest movers this month: energy, shelter and food.", 17400, 22400),
  ...demoCaptions("And it matters beyond the grocery store.", 24400, 27400),
  ...demoCaptions("Markets now think the Fed could raise rates in December.", 28800, 33800),
  ...demoCaptions("Inflation isn't a number. It's your receipt.", 35000, 38200),
];
