import type { Caption } from "@remotion/captions";
import { useVideoConfig } from "remotion";
import { useSafeZone, useScale } from "../../brand";

/** A caption word tagged with who says it ("Maya", "Jake", "Ray"). */
export type SpeakerCaption = Caption & { speaker?: string };

export type CastName = "maya" | "jake" | "ray";

/** Speaker name in captions/voice.md → character id. */
export const castOf = (speaker?: string): CastName | null => {
  const s = (speaker ?? "").toLowerCase();
  return s === "maya" || s === "jake" || s === "ray" ? s : null;
};

/** Display names and caption colors for each character. */
export const CAST: Record<CastName, { label: string; color: string }> = {
  maya: { label: "Maya", color: "#FFD866" },
  jake: { label: "Jake", color: "#FFFFFF" },
  ray: { label: "Grandpa Ray", color: "#F3E6C8" },
};

/** Default character height in design px (1080-wide frame). */
export const CHARACTER_HEIGHT = 700;

/**
 * Where the story stage sits in the frame: characters stand on `groundY`
 * (just above Facebook's bottom UI) and their heads reach about `headY`.
 * Design x (0–1080) maps to the real frame with `xOf`.
 */
export const useStage = (characterHeight = CHARACTER_HEIGHT) => {
  const { width, height } = useVideoConfig();
  const safe = useSafeZone();
  const s = useScale();
  const groundY = height - safe.bottom - 24 * s;
  const headY = groundY - characterHeight * s;
  const xOf = (designX: number) => width / 2 + (designX - 540) * s;
  return { groundY, headY, xOf, s, safe, width, height };
};

/** Default x positions (design px) for a two-character scene. */
export const POSITIONS = { left: 300, right: 780 } as const;
