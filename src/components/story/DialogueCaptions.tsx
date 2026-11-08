import React, { useMemo } from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { createTikTokStyleCaptions } from "@remotion/captions";
import { theme } from "../../brand";
import { CAST, POSITIONS, useStage, type CastName, type SpeakerCaption } from "./stage";
import { toLines } from "./useSpeakerTimeline";

export type DialogueCaptionsProps = {
  /** Speaker-tagged word timings (captions.json with a `speaker` on every word). */
  captions: SpeakerCaption[];
  /** Where each character stands (design px), to point the bubble at the speaker. */
  positions?: Partial<Record<CastName, number>>;
  /** No captions before this frame (e.g. while the EpisodeTitle shows the hook). */
  hideBefore?: number;
  /** Frame ranges [from, to) shown as plain captions in the bottom band instead of bubbles (the Mechanism Moment). */
  plainDuring?: [number, number][];
  /** Words closer together than this share a bubble. */
  combineWithinMs?: number;
};

/**
 * Story-episode captions: a speech bubble above whoever is talking, in their
 * color (Maya gold, Jake white, Ray cream), 2–5 words at a time with the spoken
 * word popped. Use instead of Captions in story episodes.
 */
export const DialogueCaptions: React.FC<DialogueCaptionsProps> = ({
  captions,
  positions = {},
  hideBefore = 0,
  plainDuring = [],
  combineWithinMs = 1100,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const s = stage.s;

  // Pages are made per line so a bubble never mixes two speakers.
  const pages = useMemo(
    () =>
      toLines(captions).flatMap((line) =>
        createTikTokStyleCaptions({ captions: line.tokens, combineTokensWithinMilliseconds: combineWithinMs }).pages.map(
          (p) => ({ ...p, speaker: line.speaker }),
        ),
      ),
    [captions, combineWithinMs],
  );

  if (frame < hideBefore) return null;
  const ms = (frame / fps) * 1000;
  const page = pages.find((p) => ms >= p.startMs && ms < p.startMs + p.durationMs);
  if (!page) return null;

  const who = page.speaker;
  const cast = CAST[who];
  const plain = plainDuring.some(([a, b]) => frame >= a && frame < b);
  const pop = spring({ frame: frame - Math.round((page.startMs / 1000) * fps), fps, config: theme.motion.springSnappy });

  const words = (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: "0.26em",
        fontFamily: theme.fonts.display,
        fontWeight: 800,
        fontSize: (plain ? 62 : 56) * s,
        lineHeight: 1.18,
        letterSpacing: "-0.02em",
        textAlign: "center",
      }}
    >
      {page.tokens.map((tok, i) => {
        const active = ms >= tok.fromMs && ms < tok.toMs;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              color: active ? cast.color : plain ? theme.colors.ink : `${cast.color}D9`,
              transform: active ? "scale(1.07)" : undefined,
              textShadow: plain ? "0 3px 0 #000, 0 0 18px rgba(0,0,0,0.75)" : undefined,
            }}
          >
            {tok.text.trim()}
          </span>
        );
      })}
    </div>
  );

  if (plain) {
    return (
      <div
        style={{
          position: "absolute",
          left: stage.safe.left,
          right: stage.safe.right,
          bottom: stage.safe.bottom + 40 * s,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ maxWidth: 900 * s }}>{words}</div>
      </div>
    );
  }

  // Bubble sits above the heads, nudged toward the speaker; the tail points at them.
  const speakerX = stage.xOf(positions[who] ?? (who === "maya" ? POSITIONS.left : POSITIONS.right));
  const bubbleW = 760 * s;
  const minL = stage.safe.left;
  const maxL = stage.width - stage.safe.right - bubbleW;
  const left = Math.max(minL, Math.min(maxL, speakerX - bubbleW / 2));
  const tailX = Math.max(left + 50 * s, Math.min(left + bubbleW - 50 * s, speakerX));
  const bottom = stage.height - stage.headY + 36 * s;

  return (
    <div
      style={{
        position: "absolute",
        left,
        width: bubbleW,
        bottom,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transform: `scale(${0.9 + 0.1 * pop})`,
        transformOrigin: `${tailX - left}px 100%`,
        opacity: Math.min(1, pop * 1.5),
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          boxSizing: "border-box",
          padding: `${18 * s}px ${30 * s}px ${22 * s}px`,
          borderRadius: 34 * s,
          background: "rgba(16,16,20,0.92)",
          border: `${4 * s}px solid ${cast.color}`,
          boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -20 * s,
            left: Math.max(24 * s, Math.min(bubbleW - 220 * s, tailX - left - 80 * s)),
            padding: `${4 * s}px ${16 * s}px`,
            borderRadius: 999,
            background: cast.color,
            color: theme.colors.onAccent,
            fontFamily: theme.fonts.body,
            fontWeight: 800,
            fontSize: 22 * s,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          {cast.label}
        </div>
        {words}
      </div>
      <svg
        width={44 * s}
        height={30 * s}
        viewBox="0 0 44 30"
        style={{ position: "absolute", bottom: -26 * s, left: tailX - left - 22 * s, overflow: "visible" }}
      >
        <path d="M 2 0 L 22 28 L 42 0" fill="rgba(16,16,20,0.92)" stroke={cast.color} strokeWidth={4} strokeLinejoin="round" />
        <rect x={4} y={-4} width={36} height={6} fill="rgba(16,16,20,1)" />
      </svg>
    </div>
  );
};
