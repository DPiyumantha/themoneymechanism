import type { SpeakerCaption } from "./stage";

/**
 * PREVIEW ONLY: speaker-tagged captions spread evenly over each line, so a story
 * episode can be built before its voice-over exists. Real episodes use
 * captions.json transcribed from voiceover.mp3, with a speaker on every word.
 */
export const demoDialogue = (lines: [speaker: string, text: string, startMs: number, endMs: number][]) =>
  lines.flatMap(([speaker, text, startMs, endMs]): SpeakerCaption[] => {
    const words = text.split(" ");
    const step = (endMs - startMs) / words.length;
    return words.map((w, i) => ({
      text: i === 0 ? w : ` ${w}`,
      startMs: Math.round(startMs + i * step),
      endMs: Math.round(startMs + (i + 1) * step),
      timestampMs: Math.round(startMs + (i + 0.5) * step),
      confidence: 1,
      speaker,
    }));
  });
