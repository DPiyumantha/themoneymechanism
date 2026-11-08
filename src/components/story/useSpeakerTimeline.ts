import { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { castOf, type CastName, type SpeakerCaption } from "./stage";

export type DialogueLine = {
  speaker: CastName;
  startMs: number;
  endMs: number;
  tokens: SpeakerCaption[];
};

/** Groups consecutive caption words by speaker into dialogue lines. */
export const toLines = (captions: SpeakerCaption[]): DialogueLine[] => {
  const lines: DialogueLine[] = [];
  for (const c of captions) {
    const who = castOf(c.speaker);
    if (!who) continue;
    const last = lines[lines.length - 1];
    if (last && last.speaker === who && c.startMs - last.endMs < 900) {
      last.tokens.push(c);
      last.endMs = c.endMs;
    } else {
      lines.push({ speaker: who, startMs: c.startMs, endMs: c.endMs, tokens: [c] });
    }
  }
  return lines;
};

/**
 * Who is talking right now, from speaker-tagged captions.
 * Drives each Character's mouth (`isTalking`) and line-start bounce (`lineStartOf`).
 */
export const useSpeakerTimeline = (captions: SpeakerCaption[]) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lines = useMemo(() => toLines(captions), [captions]);
  const ms = (frame / fps) * 1000;

  const line = lines.find((l) => ms >= l.startMs && ms <= l.endMs + 120) ?? null;
  // Mouth moves while inside a word, and through short gaps between words.
  const inWord = line
    ? line.tokens.some((t, i) => {
        const next = line.tokens[i + 1];
        const end = next && next.startMs - t.endMs < 220 ? next.startMs : t.endMs;
        return ms >= t.startMs && ms < end;
      })
    : false;

  const lastLineStart = (who: CastName) => {
    let at: number | undefined;
    for (const l of lines) {
      if (l.speaker === who && l.startMs <= ms) at = Math.round((l.startMs / 1000) * fps);
    }
    return at;
  };

  return {
    lines,
    line,
    speaker: line?.speaker ?? null,
    isTalking: (who: CastName) => line?.speaker === who && inWord,
    /** Frame where `who` last started a line (for the start-of-line bounce). */
    lineStartOf: lastLineStart,
  };
};
