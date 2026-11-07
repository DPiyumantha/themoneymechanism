import type { Caption } from "@remotion/captions";

/**
 * PREVIEW ONLY. Spreads a sentence evenly over a time range so captions show
 * before a voice-over exists. Real videos use word timings transcribed from
 * the voice-over (see the money-mechanism-video skill, production guide).
 */
export const demoCaptions = (text: string, startMs: number, endMs: number): Caption[] => {
  const words = text.split(" ");
  const step = (endMs - startMs) / words.length;
  return words.map((w, i) => ({
    text: i === 0 ? w : ` ${w}`,
    startMs: Math.round(startMs + i * step),
    endMs: Math.round(startMs + (i + 1) * step),
    timestampMs: Math.round(startMs + (i + 0.5) * step),
    confidence: 1,
  }));
};
